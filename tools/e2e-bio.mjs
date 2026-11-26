// Browser-Test Biologie (Hund und Katze): Fach-Umschalter, jede Aufgabenart richtig/falsch, Fehlerkiste, Probearbeit mit Note, Layout, Bio-Termin.
// Aufruf: node tools/e2e-bio.mjs [Ordner für Screenshots]
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
const shot = async (p, n) => { if (shots) await p.screenshot({ path: path.join(shots, "bio-" + n + ".png") }); };
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

// 1) Start: drei Fächer, Biologie hat 6 Themen, kein Termin gesetzt
{
  const { ctx, p } = await open({ width: 1180, height: 820 }, { fach: "bio" });
  check(await p.locator(".fachtabs button").count() === 3 && await p.locator('.fachtabs button.on[data-v="bio"]').count() === 1, "Drei Fächer, Biologie ist vorgewählt");
  check(await p.locator(".tcard").count() === 10, "10 Themen im Fach Biologie");
  const names = (await p.locator(".tcard .tname").allTextContents()).join("|");
  check(/Hund/.test(names) && /skelett/i.test(names) && /gebiss/i.test(names) && /Hunderassen/.test(names) && /Welpe/.test(names) && /Wolf/.test(names) && /Körpersprache/.test(names) && /Geruchssinn/.test(names) && /Hundehaltung/.test(names) && /Katze/.test(names), "Themen: Hund, Skelett, Gebiss, Rassen, Welpe, Wolf, Körpersprache, Geruchssinn, Hundehaltung, Katze");
  check(await p.locator(".tcard.extra").count() === 1 && /Katze/.test(await p.locator(".tcard.extra").textContent()), "Nur die Katze ist als „nicht auf dem Lernzettel“ markiert");
  check(await p.evaluate(() => window.__EMMA.S.set.dateBio) === "2026-12-04" && /Bio-Arbeit/.test(await p.textContent(".countdown")), "Termin der Bio-Arbeit ist der 4.12., Countdown nennt sie: " + (await p.textContent(".countdown")).trim());
  check(await p.locator(".goal").count() === 1, "Karte „Mein Weg zur Eins“ auch in Biologie");
  await p.click('[data-act="settings"]'); await p.waitForSelector(".settings");
  await p.fill('[data-set="dateBio"]', "");
  await p.dispatchEvent('[data-set="dateBio"]', "change");
  await p.click('[data-act="home"]');
  check(!/Bio-Arbeit/.test(await p.textContent(".countdown")), "Ohne Termin (Feld leer) kein Countdown");
  await p.click('[data-act="settings"]'); await p.waitForSelector(".settings");
  await p.fill('[data-set="dateBio"]', "2099-01-10");
  await p.dispatchEvent('[data-set="dateBio"]', "change");
  await p.click('[data-act="home"]');
  check(/Bio-Arbeit/.test(await p.textContent(".countdown")), "Mit neuem Termin: Countdown nennt die Bio-Arbeit");
  await shot(p, "start");
  await p.click('.fachtabs button[data-v="nw"]');
  check(await p.locator(".tcard").count() === 4 && !/Bio-Arbeit/.test(await p.textContent(".countdown")), "Naturwissenschaften: 4 Themen, kein Bio-Countdown");
  await p.click('.fachtabs button[data-v="mathe"]');
  check(await p.locator(".tcard").count() === 13, "Mathe: 13 Themen");
  await p.click('.fachtabs button[data-v="bio"]');
  await p.reload(); await p.waitForSelector(".topics");
  check(await p.locator('.fachtabs button.on[data-v="bio"]').count() === 1 && await p.evaluate(() => window.__EMMA.S.set.dateBio) === "2099-01-10", "Fach und Termin bleiben nach dem Neuladen");
  check(p.errors.length === 0, "Start ohne Fehler " + p.errors.join("|"));
  await ctx.close();
}

// 2) Jede Aufgabenart: richtig wird erkannt, falsch landet in der Fehlerkiste
{
  const { ctx, p } = await open({ width: 1180, height: 820 }, { fach: "bio" });
  const gens = await p.evaluate(() => window.Aufgaben.TOPICS.filter((t) => t.fach === "bio").flatMap((t) => t.gens.map((g) => [t.id, g])));
  check(gens.length >= 14, "Aufgabenarten im Fach: " + gens.length);
  let bad = 0;
  for (const [topic, gen] of gens) {
    await p.evaluate(() => window.__EMMA.go("home"));
    await p.click(`[data-act="topic"][data-v="${topic}"]`);
    check(/./.test(await p.textContent(".merke")), "Merkkasten vorhanden: " + topic) || 0;
    await p.click(`[data-act="startGen"][data-v="${gen}"]`);
    await p.waitForSelector(".task");
    await solveIn(p, ".task");
    await p.click('[data-act="check"]').catch(() => {});
    const okk = await p.waitForSelector(".fb.ok", { timeout: 2000 }).then(() => true, () => false);
    if (!okk) { bad++; console.log("  nicht erkannt:", gen); }
    if (gen === "bio.skelett.bild") await shot(p, "skelett");
    if (gen === "bio.gebiss.bild") await shot(p, "gebiss");
  }
  check(bad === 0, "richtige Antworten werden bei allen Aufgabenarten erkannt");
  // falsch beantwortet: zweimal falsch -> Fehlerkiste
  await p.evaluate(() => window.__EMMA.go("home"));
  await p.click('[data-act="topic"][data-v="welpe"]');
  await p.click('[data-act="startGen"][data-v="bio.welpe.fakt"]');
  await p.waitForSelector(".task");
  for (let i = 0; i < 2; i++) { await solveIn(p, ".task", 0, true); await p.click('[data-act="check"]').catch(() => {}); await p.waitForTimeout(200); }
  check(await p.evaluate(() => window.__EMMA.S.box.some((b) => b.gen === "bio.welpe.fakt")), "Falsche Antwort kommt in die Fehlerkiste");
  check(p.errors.length === 0, "Aufgaben ohne Fehler " + p.errors.join("|"));
  await ctx.close();
}

// 3) Keine Wiederholungen in einer Runde, mit Bildern
{
  const { ctx, p } = await open({ width: 1180, height: 820 }, { fach: "bio", roundLen: 8 });
  await p.click('[data-act="topic"][data-v="hund"]');
  await p.click('[data-act="startGen"][data-v="bio.typ"]');
  const qs = [];
  for (let i = 0; i < 8; i++) {
    await p.waitForSelector(".task");
    qs.push(await p.evaluate(() => window.__EMMA.P.cur.t.q));
    await solveIn(p, ".task");
    await p.click('[data-act="check"]');
    await p.waitForSelector(".fb.ok");
    await p.click('[data-act="next"]');
  }
  check(new Set(qs).size === 8, `8 verschiedene Fragen in einer Runde (${new Set(qs).size})`);
  await ctx.close();
}

// 4) Probearbeit Biologie: alles richtig = Note 1, leer = Note 6
{
  const { ctx, p } = await open({ width: 1180, height: 820 }, { fach: "bio" });
  await p.click('[data-act="examIntro"]');
  check(/Hund/.test(await p.textContent(".exami")) && /Wolf/.test(await p.textContent(".exami")) && !/Katze/.test(await p.textContent(".exami")), "Probearbeit-Einleitung nennt die Themen des Fachs (ohne Katze)");
  await p.click('[data-act="examStart"]');
  await p.waitForSelector(".etask");
  const nParts = await p.locator(".apart").count(), nTasks = await p.locator(".etask").count();
  check(nParts === 7 && nTasks >= 30, `Probearbeit: ${nParts} Aufgabengruppen, ${nTasks} Aufgaben`);
  await shot(p, "probearbeit");
  for (let i = 0; i < nTasks; i++) await solveIn(p, ".etask", i);
  await p.click('[data-act="examSubmit"]');
  await p.waitForSelector(".note-big");
  const note = (await p.textContent(".note-big b")).trim(), pct = await p.evaluate(() => window.__EMMA.S.exams[0].pct);
  check(note === "1" && pct === 100, `Alles richtig: Note ${note}, ${pct} %`);
  check(/Körpersprache/.test(await p.textContent(".result")) && /Welpe/.test(await p.textContent(".result")) && !/Katze/.test(await p.textContent(".result")), "Auswertung nach Themen");
  await p.click('[data-act="home"]');
  check(/100 %/.test(await p.textContent(".goal")) && /geschafft/.test(await p.textContent(".goal")), "Eins-Karte zeigt die beste Probearbeit");
  await p.click('[data-act="examIntro"]'); await p.click('[data-act="examStart"]');
  await p.waitForSelector(".etask");
  await p.click('[data-act="examSubmit"]');
  await p.waitForSelector(".note-big");
  check((await p.textContent(".note-big b")).trim() === "6", "Nichts abgegeben: Note 6");
  check(await p.evaluate(() => window.__EMMA.S.exams.length === 2 && window.__EMMA.S.exams.every((e) => e.fach === "bio")), "Probearbeiten sind als Biologie gemerkt");
  // die Probearbeit im Fach Biologie zählt nicht für Naturwissenschaften
  await p.click('[data-act="home"]'); await p.click('.fachtabs button[data-v="nw"]');
  check(/Schreibe eine Probearbeit/.test(await p.textContent(".goal")), "Naturwissenschaften: eigene Eins-Karte, noch keine Probearbeit");
  check(p.errors.length === 0, "Probearbeit ohne Fehler " + p.errors.join("|"));
  await ctx.close();
}

// 5) Alter Spielstand: schaltet einmal auf Biologie, alles andere bleibt
{
  const ctx = await b.newContext({ viewport: { width: 1180, height: 820 }, serviceWorkers: "block" });
  await ctx.addInitScript(() => {
    window.__EMMA_TEST = { noSW: true };
    if (!sessionStorage.getItem("seed")) { sessionStorage.setItem("seed", "1"); localStorage.setItem("capy-mathe-v1", JSON.stringify({ v: 1, xp: 700, fach: "nw", scene: "onsenschnee", wear: ["bommel"], stickers: ["start"], box: [], exams: [{ d: 1, fach: "nw", pct: 88, txt: "2", got: 30, max: 34, seed: 5, per: [], byTopic: [], wrong: [] }], gens: {}, days: {}, flags: { winter1: true, xpBase: 700 }, set: { season: "winter", dateNw: "2026-11-23" }, stats: { tasks: 40, ok: 30, help: 2 } })); }
  });
  const p = await ctx.newPage(); p.errors = [];
  p.on("pageerror", (e) => p.errors.push(String(e)));
  await p.goto(url); await p.waitForSelector(".topics");
  const st = await p.evaluate(() => JSON.parse(JSON.stringify(window.__EMMA.S)));
  check(st.fach === "bio" && st.xp === 700 && st.stats.tasks === 40 && st.exams.length === 1 && st.set.dateBio === "2026-12-04" && st.set.dateNw === "2026-11-23", "Alter Stand: Biologie vorgewählt, Punkte, Probearbeit und Termine bleiben");
  await p.click('.fachtabs button[data-v="nw"]');
  await p.reload(); await p.waitForSelector(".topics");
  check(await p.evaluate(() => window.__EMMA.S.fach) === "nw", "Umschalten wird nur einmal erzwungen");
  check(p.errors.length === 0, "ohne Fehler " + p.errors.join("|"));
  await ctx.close();
}

// 6) Layout: Hochformat und Handy, Bilder passen
for (const [name, size] of [["iPad hoch", { width: 820, height: 1180 }], ["Handy", { width: 390, height: 844 }]]) {
  const { ctx, p } = await open(size, { fach: "bio", forceGen: "bio.skelett.bild" });
  check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: Start ohne seitliches Scrollen`);
  const tabs = await p.locator(".fachtabs").boundingBox();
  check(tabs && tabs.x >= 0 && tabs.x + tabs.width <= size.width + 1, `${name}: drei Fach-Reiter passen`);
  await p.click('[data-act="topic"][data-v="skelett"]');
  await p.click('[data-act="startGen"][data-v="bio.skelett.bild"]');
  await p.waitForSelector(".task svg.skel");
  const svg = await p.locator(".task svg.skel").boundingBox();
  check(svg && svg.width >= 200 && svg.x >= 0 && svg.x + svg.width <= size.width, `${name}: Skelett-Bild sichtbar (${Math.round(svg ? svg.width : 0)} px)`);
  check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: Aufgabe ohne seitliches Scrollen`);
  if (name === "Handy") await shot(p, "handy");
  await ctx.close();
}

await b.close(); srv.close();
console.log(fails ? `${fails} Fehler` : "alle Biologie-Tests ok");
process.exit(fails ? 1 : 0);
