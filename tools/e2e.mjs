// Browser-Test: jede Aufgaben-Art einmal richtig lösen, Hilfe, Fehlerkiste, Probearbeit mit Note, Neuladen.
// Aufruf: node tools/e2e.mjs [Ordner für Screenshots]
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
const check = (c, m) => { if (!c) { fails++; console.log("FAIL", m); } };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: shots ? 2 : 1, serviceWorkers: "block" });
await ctx.addInitScript(() => { window.__EMMA_TEST = Object.assign({ noSW: true, roundLen: 3, noFocus: true }, JSON.parse(sessionStorage.getItem("emmaTest") || "{}")); });
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
p.on("dialog", (d) => d.accept());
const shot = async (n) => { if (shots) await p.screenshot({ path: path.join(shots, n + ".png"), fullPage: false }); };
await p.goto(url);
await p.evaluate(() => { window.__EMMA.S.set.theme = "hell"; window.__EMMA.save(); });
await p.reload();
await p.waitForSelector(".topics");
check((await p.$$(".tcard")).length === 13, "13 Themen auf der Startseite");
await shot("01-start");

// Löst die Aufgabe in einem Element richtig (im Browser)
const solveIn = (sel, idx) => p.evaluate(([sel, idx]) => {
  const el = document.querySelectorAll(sel)[idx || 0];
  const E = window.__EMMA;
  let t;
  if (el.dataset.k === "p") t = E.P.cur.t;
  else { const [ai, ti] = el.dataset.k.split(".").map(Number); t = E.EX.parts[ai].tasks[ti]; }
  const setv = (f, v) => { const x = el.querySelector(`[data-f="${f}"]`); x.value = v; x.dispatchEvent(new Event("input", { bubbles: true })); };
  const nf = (s) => String(s).replace(/[ \s]/g, "");
  switch (t.kind) {
    case "num": if (t.withRest) { const [q, r] = t.answer.split(" Rest "); setv("q", nf(q)); setv("r", r || ""); } else setv("v", nf(t.answer)); break;
    case "text": setv("v", t.answer); break;
    case "choice": case "cmp": el.querySelector(`.opt[data-i="${t.correct}"]`).click(); break;
    case "cells": case "holes": case "mauer": case "kette": t.cells.forEach((c, i) => setv("c" + i, c.ans)); break;
    case "place": el.querySelector(`.hit[data-v="${t.target}"]`).dispatchEvent(new MouseEvent("click", { bubbles: true })); break;
    case "order": t.items.slice().sort((a, b) => a - b).forEach((v) => el.querySelector(`.chipn[data-v="${v}"]`).click()); break;
    case "written":
      setv("ue", window.Aufgaben.ueBeispiel(t.op, t.nums));
      if (t.op === "/") { setv("res", String(t.res)); setv("rest", t.rest ? String(t.rest) : ""); }
      else { const cells = [...el.querySelectorAll('.wrow.res [data-f^="r"]')], s = String(t.res); cells.forEach((c, i) => { const k = i - (cells.length - s.length); c.value = k >= 0 ? s[k] : ""; }); }
      break;
  }
  return t.gen + ":" + t.kind;
}, [sel, idx]);

// 1) Jede Aufgaben-Art: über jedes Thema und jede Fertigkeit eine richtige Antwort
const gens = await p.evaluate(() => window.Aufgaben.TOPICS.flatMap((t) => t.gens.map((g) => [t.id, g])));
const kindsSeen = new Set();
for (const [topic, gen] of gens) {
  await p.evaluate(() => window.__EMMA.go("home"));
  await p.click(`[data-act="topic"][data-v="${topic}"]`);
  await p.click(`[data-act="startGen"][data-v="${gen}"]`);
  await p.waitForSelector(".task");
  const k = await solveIn(".task");
  kindsSeen.add(k.split(":")[1]);
  if (gen === "schrift.mul") await shot("03-schriftlich-mal");
  if (gen === "strahl.lesen") await shot("04-zahlenstrahl");
  if (gen === "dia.lesen") await shot("05-diagramm");
  if (gen === "platz.mauer") await shot("06-zahlenmauer");
  await p.click('[data-act="check"]');
  const ok = await p.waitForSelector(".fb.ok", { timeout: 2000 }).then(() => true, () => false);
  check(ok, "richtige Antwort nicht erkannt: " + k);
  if (gen === "schrift.div") await shot("07-richtig");
}
check(kindsSeen.size === 11, "alle 11 Eingabearten getestet: " + [...kindsSeen].join(","));

// Thema-Seite
await p.evaluate(() => window.__EMMA.go("topic", { topic: "runden" }));
await shot("02-thema-runden");

// 2) Hilfe und Fehlerkiste: falsch antworten
await p.evaluate(() => { sessionStorage.setItem("emmaTest", JSON.stringify({ forceGen: "runden.auf" })); });
await p.reload();
await p.click('[data-act="topic"][data-v="runden"]');
await p.click('[data-act="startTopic"][data-v="runden"]');
await p.click('[data-act="help"]');
check((await p.$$(".hint")).length === 1, "Tipp 1 erscheint");
await p.click('[data-act="help"]');
await p.click('[data-act="help"]');
check(!!(await p.$(".hint.sol")), "Lösungsweg erscheint nach den Tipps");
await shot("08-hilfe");
await p.fill('.task [data-f="v"]', "1");
await p.click('[data-act="check"]');
check(!!(await p.$(".fb.warn")), "erster Fehlversuch: Hinweis statt Auflösung");
await p.fill('.task [data-f="v"]', "2");
await p.click('[data-act="check"]');
check(!!(await p.$(".fb.bad")), "zweiter Fehlversuch: Auflösung");
await shot("09-falsch");
check((await p.evaluate(() => window.__EMMA.S.box.length)) >= 1, "Fehler landet in der Fehlerkiste");
// Rest der Runde
for (let i = 0; i < 5; i++) {
  if (await p.$(".end")) break;
  const nx = await p.$('[data-act="next"]');
  if (nx) { await nx.click(); continue; }
  await solveIn(".task"); await p.click('[data-act="check"]');
}
check(!!(await p.$(".end")), "Rundenende erreicht");
await shot("10-rundenende");

// 3) Fehlerkiste leeren: jede Aufgabe zweimal richtig
await p.evaluate(() => { sessionStorage.setItem("emmaTest", "{}"); });
await p.reload();
for (let round = 0; round < 6; round++) {
  const n = await p.evaluate(() => window.__EMMA.S.box.length);
  if (!n) break;
  await p.evaluate(() => window.__EMMA.go("home"));
  await p.click('[data-act="box"]');
  for (let i = 0; i < 10; i++) {
    if (await p.$(".end")) break;
    await solveIn(".task"); await p.click('[data-act="check"]');
    await p.click('[data-act="next"]');
  }
}
check((await p.evaluate(() => window.__EMMA.S.box.length)) === 0, "Fehlerkiste ist leer");
check(await p.evaluate(() => window.__EMMA.S.stickers.includes("kiste")), "Sticker für geleerte Fehlerkiste");

// 4) Probearbeit: alles richtig -> Note 1
await p.evaluate(() => window.__EMMA.go("home"));
await p.click('[data-act="examIntro"]');
await shot("11-probearbeit-start");
await p.click('[data-act="examStart"]');
await p.waitForSelector(".etask");
const nTasks = (await p.$$(".etask")).length;
check(nTasks >= 25, "Probearbeit hat genug Aufgaben: " + nTasks);
await shot("12-probearbeit");
for (let i = 0; i < nTasks; i++) await solveIn(".etask", i);
// Neuladen mitten in der Arbeit: Antworten bleiben erhalten
await p.waitForTimeout(400);
await p.evaluate(() => { const E = window.__EMMA; E.save(); });
await p.reload();
check(!!(await p.$('[data-act="examResume"]')), "angefangene Probearbeit wird angeboten");
await p.click('[data-act="examResume"]');
await p.waitForSelector(".etask");
await p.click('[data-act="examSubmit"]');
await p.waitForSelector(".note-big");
const grade = await p.textContent(".note-big b");
check(grade.trim() === "1", "alles richtig gibt Note 1, war: " + grade);
await shot("13-auswertung");

// 5) Zeit läuft ab -> automatische Abgabe, leere Arbeit = Note 6
await p.evaluate(() => { sessionStorage.setItem("emmaTest", JSON.stringify({ examMs: 1500 })); });
await p.reload();
await p.click('[data-act="examIntro"]');
await p.click('[data-act="examStart"]');
await p.waitForSelector(".note-big", { timeout: 6000 }).catch(() => {});
check((await p.textContent(".note-big b").catch(() => "")).trim() === "6", "Zeit um: automatische Abgabe mit Note 6");
check((await p.evaluate(() => window.__EMMA.S.exams.length)) === 2, "zwei Probearbeiten gespeichert");

// 6) Orte, Outfits, Album, Einstellungen
await p.evaluate(() => { sessionStorage.setItem("emmaTest", "{}"); });
await p.reload();
await p.click('[data-act="cozy"]');
await p.click('[data-act="scene"][data-v="wald"]');
check(await p.evaluate(() => window.__EMMA.S.scene === "wald"), "Ort gewählt");
await p.click('[data-act="wear"][data-v="schal"]');
check(await p.evaluate(() => window.__EMMA.S.wear.includes("schal")), "Outfit angezogen");
await shot("14-orte-outfits");
await p.evaluate(() => window.__EMMA.go("album"));
check((await p.$$(".sticker.has")).length >= 5, "Sticker gesammelt");
await shot("15-album");
await p.evaluate(() => window.__EMMA.go("settings"));
await p.fill('[data-key="0"]', "95");
await p.dispatchEvent('[data-key="0"]', "change");
check(await p.evaluate(() => window.__EMMA.S.set.key[0] === 95), "Notenschlüssel änderbar");
await p.evaluate(() => window.__EMMA.go("home"));
await shot("16-start-danach");

// 7) Dunkelmodus und Handy-Breite
await p.evaluate(() => { window.__EMMA.S.set.theme = "dunkel"; window.__EMMA.render(); });
await shot("17-dunkel");
await p.setViewportSize({ width: 390, height: 844 });
await p.evaluate(() => { window.__EMMA.S.set.theme = "hell"; window.__EMMA.go("topic", { topic: "addsub" }); });
await p.click('[data-act="startGen"][data-v="schrift.add"]');
const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
check(!overflow, "kein seitliches Scrollen auf schmalen Geräten");
await shot("18-handy");

// 8) Kaputter Spielstand
await p.evaluate(() => localStorage.setItem("capy-mathe-v1", '{"xp":"viel","box":7,"gens":[],"set":{"key":[1,2]}}'));
await p.reload();
check(!!(await p.$(".topics")), "kaputter Spielstand: App startet trotzdem");
await p.evaluate(() => localStorage.setItem("capy-mathe-v1", "{kaputt"));
await p.reload();
check(!!(await p.$(".topics")), "unlesbarer Spielstand: App startet trotzdem");

check(!errors.length, "keine Fehler in der Konsole: " + errors.join(" | "));
await b.close();
srv.close();
console.log(fails ? `${fails} Fehler` : "e2e ok");
process.exit(fails ? 1 : 0);
