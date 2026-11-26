// Browser-Test Naturwissenschaften: Fach-Umschalter, jede Aufgabenart, Fehlerkiste, Probearbeit mit Note, Layout.
// Aufruf: node tools/e2e-nw.mjs [Ordner für Screenshots]
import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");
const root = path.resolve("public");
const shots = process.argv[2] || null;
if (shots) fs.mkdirSync(shots, { recursive: true });
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json" };
const srv = http.createServer((q, r) => {
  const f = path.join(root, q.url === "/" ? "index.html" : q.url.split("?")[0]);
  fs.readFile(f, (e, d) => (e ? (r.writeHead(404), r.end()) : (r.writeHead(200, { "content-type": types[path.extname(f)] || "text/plain" }), r.end(d))));
}).listen(0);
const url = `http://localhost:${srv.address().port}/`;
let fails = 0;
const check = (c, m) => { if (!c) { fails++; console.log("FAIL", m); } else console.log("ok  ", m); };
const b = await chromium.launch();

async function open(size = { width: 1180, height: 820 }, test = {}) {
  const ctx = await b.newContext({ viewport: size, hasTouch: true, serviceWorkers: "block" });
  await ctx.addInitScript((t) => { window.__EMMA_TEST = Object.assign({ noSW: true, roundLen: 3, noFocus: true }, t); }, test);
  const p = await ctx.newPage();
  p.errors = [];
  p.on("pageerror", (e) => p.errors.push(String(e)));
  p.on("console", (m) => m.type() === "error" && p.errors.push(m.text()));
  p.on("dialog", (d) => d.accept());
  await p.goto(url);
  await p.waitForSelector(".topics");
  return { ctx, p };
}
const shot = async (p, n) => { if (shots) await p.screenshot({ path: path.join(shots, "nw-" + n + ".png") }); };
// löst die Aufgabe in einem Element richtig; mit wrong=true falsch
const solveIn = (p, sel, idx, wrong) => p.evaluate(([sel, idx, wrong]) => {
  const el = document.querySelectorAll(sel)[idx || 0], E = window.__EMMA;
  let t;
  if (el.dataset.k === "p") t = E.P.cur.t; else { const [ai, ti] = el.dataset.k.split(".").map(Number); t = E.EX.parts[ai].tasks[ti]; }
  const setv = (f, v) => { const x = el.querySelector(`[data-f="${f}"]`); x.value = v; x.dispatchEvent(new Event("input", { bubbles: true })); };
  switch (t.kind) {
    case "num": setv("v", wrong ? "0" : String(t.answer).replace(/\s/g, "")); break;
    case "text": setv("v", wrong ? "xyz" : t.answer); break;
    case "choice": el.querySelector(`.opt[data-i="${wrong ? (t.correct + 1) % t.options.length : t.correct}"]`).click(); break;
  }
  return t.gen + ":" + t.kind;
}, [sel, idx, wrong]);

// 1) Start: Fach-Umschalter, Themen, Countdown
{
  const { ctx, p } = await open();
  check(await p.locator('.fachtabs button.on[data-v="nw"]').count() === 1, "Fach Naturwissenschaften ist vorgewählt");
  check(await p.locator(".tcard").count() === 4, "4 Themen im Fach Naturwissenschaften");
  const names = (await p.locator(".tcard .tname").allTextContents()).join("|");
  check(/Sonnensystem/.test(names) && /Sterne/.test(names) && /ISS/.test(names) && /Gradnetz/.test(names), "Themen: Sonnensystem, Sterne, ISS, Gradnetz");
  check(/NW-Arbeit|geschafft/.test(await p.textContent(".countdown")), "Countdown nennt die NW-Arbeit (oder, nach dem Termin, „geschafft“): " + (await p.textContent(".countdown")).trim());
  const d = await p.evaluate(() => window.__EMMA.S.set.dateNw);
  check(d === "2026-11-23", "Datum der Arbeit 23.11.");
  check(await p.locator(".goal").count() === 1 && /Weg zur Eins/.test(await p.textContent(".goal")) && /ab <b>/.test(await p.innerHTML(".goal")) , "Karte „Mein Weg zur Eins“ im Fach");
  await shot(p, "start");
  await p.click('.fachtabs button[data-v="mathe"]');
  check(await p.locator(".tcard").count() === 13 && !/NW-Arbeit/.test(await p.textContent(".countdown")), "Mathe: 13 Themen, kein NW-Countdown");
  await p.reload(); await p.waitForSelector(".topics");
  check(await p.locator('.fachtabs button.on[data-v="mathe"]').count() === 1, "Fach bleibt nach dem Neuladen");
  await p.click('.fachtabs button[data-v="nw"]');
  check(p.errors.length === 0, "Start ohne Fehler " + p.errors.join("|"));
  await ctx.close();
}

// 2) Jede Aufgabenart einmal richtig, dann einmal falsch -> Fehlerkiste
{
  const { ctx, p } = await open();
  const gens = await p.evaluate(() => window.Aufgaben.TOPICS.filter((t) => t.fach === "nw").flatMap((t) => t.gens.map((g) => [t.id, g])));
  check(gens.length >= 15, "Aufgabenarten im Fach: " + gens.length);
  let bad = 0;
  for (const [topic, gen] of gens) {
    await p.evaluate(() => window.__EMMA.go("home"));
    await p.click(`[data-act="topic"][data-v="${topic}"]`);
    await p.click(`[data-act="startGen"][data-v="${gen}"]`);
    await p.waitForSelector(".task");
    await solveIn(p, ".task");
    await p.click('[data-act="check"]').catch(() => {});
    const okk = await p.waitForSelector(".fb.ok", { timeout: 2000 }).then(() => true, () => false);
    if (!okk) { bad++; console.log("  nicht erkannt:", gen); }
    if (gen === "nw.gradnetz.bild") await shot(p, "gradnetz");
    if (gen === "nw.bild") await shot(p, "sonnensystem");
  }
  check(bad === 0, "richtige Antworten werden bei allen Aufgabenarten erkannt");
  // Fehlerkiste: Text-Aufgabe zweimal falsch
  await p.evaluate(() => { sessionStorage.setItem("emmaTest", JSON.stringify({})); });
  await p.evaluate(() => window.__EMMA.go("home"));
  await p.click('[data-act="topic"][data-v="sonne"]');
  await p.click('[data-act="startGen"][data-v="nw.merksatz"]');
  await p.waitForSelector(".task");
  const lv = await p.evaluate(() => window.__EMMA.P.cur.t.kind);
  await solveIn(p, ".task", 0, true);
  await p.click('[data-act="check"]').catch(() => {});
  if (lv !== "choice" || await p.locator(".opt").count() > 3) { await solveIn(p, ".task", 0, true); await p.click('[data-act="check"]').catch(() => {}); }
  await p.waitForSelector(".fb.bad", { timeout: 3000 }).catch(() => {});
  const box = await p.evaluate(() => window.__EMMA.S.box.map((x) => x.gen));
  check(box.includes("nw.merksatz"), "falsche Aufgabe landet in der Fehlerkiste: " + box.join(","));
  check(/Richtig ist/.test(await p.textContent(".task")), "Lösung wird gezeigt");
  // Fehlerkiste leeren: Aufgabe zweimal richtig lösen
  for (let round = 0; round < 3; round++) {
    const n = await p.evaluate(() => window.__EMMA.S.box.length);
    if (!n) break;
    await p.evaluate(() => window.__EMMA.go("home"));
    await p.click('[data-act="box"]');
    await p.waitForSelector(".task");
    for (let i = 0; i < n; i++) {
      await p.waitForSelector(".task");
      await solveIn(p, ".task");
      await p.click('[data-act="check"]').catch(() => {});
      await p.waitForSelector('[data-act="next"]', { timeout: 3000 });
      await p.click('[data-act="next"]');
    }
  }
  check(await p.evaluate(() => window.__EMMA.S.box.length === 0), "Fehlerkiste ist nach zweimal richtig leer");
  check(p.errors.length === 0, "Üben ohne Fehler " + p.errors.join("|"));
  await ctx.close();
}

// 3) Probearbeit Naturwissenschaften: alles richtig = Note 1, leer = Note 6
{
  const { ctx, p } = await open();
  await p.click('[data-act="examIntro"]');
  check(/Sonnensystem/.test(await p.textContent(".exami")), "Probearbeit-Einleitung nennt die Themen des Fachs");
  await p.click('[data-act="examStart"]');
  await p.waitForSelector(".etask");
  const nParts = await p.locator(".apart").count(), nTasks = await p.locator(".etask").count();
  check(nParts === 5 && nTasks >= 20, `Probearbeit: ${nParts} Aufgabengruppen, ${nTasks} Aufgaben`);
  await shot(p, "probearbeit");
  for (let i = 0; i < nTasks; i++) await solveIn(p, ".etask", i);
  await p.click('[data-act="examSubmit"]');
  await p.waitForSelector(".note-big");
  const note = (await p.textContent(".note-big b")).trim(), pct = await p.evaluate(() => window.__EMMA.S.exams[0].pct);
  check(note === "1" && pct === 100, `Alles richtig: Note ${note}, ${pct} %`);
  check(/Gradnetz/.test(await p.textContent(".result")) && /Sonnensystem/.test(await p.textContent(".result")), "Auswertung nach Themen");
  await shot(p, "note");
  // zweite Probearbeit leer abgegeben
  await p.click('[data-act="home"]');
  check(/100 %/.test(await p.textContent(".goal")) && /geschafft/.test(await p.textContent(".goal")) && /✅ Eine Probearbeit/.test(await p.textContent(".goal")), "Eins-Karte zeigt die beste Probearbeit und den erledigten Tagespunkt");
  await p.click('[data-act="examIntro"]'); await p.click('[data-act="examStart"]');
  await p.waitForSelector(".etask");
  await p.click('[data-act="examSubmit"]');
  await p.waitForSelector(".note-big");
  check((await p.textContent(".note-big b")).trim() === "6", "Nichts abgegeben: Note 6");
  check(await p.evaluate(() => window.__EMMA.S.box.length > 5 && window.__EMMA.S.exams.length === 2 && window.__EMMA.S.exams.every((e) => e.fach === "nw")), "Fehler gehen in die Fehlerkiste, Probearbeiten sind als Naturwissenschaften gemerkt");
  check(await p.evaluate(() => window.__EMMA.S.stickers.includes("note1")), "Sticker für Note 1");
  check(p.errors.length === 0, "Probearbeit ohne Fehler " + p.errors.join("|"));
  await ctx.close();
}

// 4) Mathe-Probearbeit bleibt Mathe; Einstellungen zeigen beide Termine
{
  const { ctx, p } = await open({ width: 1180, height: 820 });
  await p.click('.fachtabs button[data-v="mathe"]');
  await p.click('[data-act="examIntro"]');
  check(/Buch-Test/.test(await p.textContent(".exami")), "Mathe-Probearbeit unverändert");
  await p.click('[data-act="home"]');
  await p.click('[data-act="settings"]');
  check(await p.locator('[data-set="dateNw"]').count() === 1 && await p.locator('[data-set="date"]').count() === 1, "Einstellungen: beide Termine");
  await ctx.close();
}

// 5) Layout: Hochformat und Handy, Bilder passen
for (const [name, size] of [["iPad hoch", { width: 820, height: 1180 }], ["Handy", { width: 390, height: 844 }]]) {
  const { ctx, p } = await open(size, { forceGen: "nw.gradnetz.bild" });
  check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: Start ohne seitliches Scrollen`);
  await p.click('[data-act="topic"][data-v="grad"]');
  await p.click('[data-act="startGen"][data-v="nw.gradnetz.bild"]');
  await p.waitForSelector(".nwfig");
  const box = await p.locator(".nwfig").boundingBox();
  check(box && box.width > 120 && box.x >= 0 && box.x + box.width <= size.width, `${name}: Gradnetz-Bild passt (${Math.round(box.width)} px)`);
  check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: Aufgabe ohne seitliches Scrollen`);
  await ctx.close();
}

// 6) Keine Wiederholungen: in einer Runde von 8 Aufgaben kommt keine Frage zweimal (Emmas Rückmeldung zu „Gradnetz: Zahlen“)
{
  const { ctx, p } = await open({ width: 1180, height: 820 }, { roundLen: 8 });
  await p.click('[data-act="topic"][data-v="grad"]');
  await p.click('[data-act="startGen"][data-v="nw.gradnetz.zahl"]');
  const qs = [];
  for (let i = 0; i < 8; i++) {
    await p.waitForSelector(".task");
    qs.push(await p.evaluate(() => window.__EMMA.P.cur.t.q));
    await solveIn(p, ".task");
    await p.click('[data-act="check"]');
    await p.waitForSelector(".fb.ok");
    await p.click('[data-act="next"]');
  }
  check(new Set(qs).size === 8, `Gradnetz-Zahlen: 8 verschiedene Fragen in einer Runde (${new Set(qs).size} verschieden)`);
  await ctx.close();
}

await b.close(); srv.close();
console.log(fails ? `${fails} Fehler` : "alle Naturwissenschaften-Tests ok");
process.exit(fails ? 1 : 0);
