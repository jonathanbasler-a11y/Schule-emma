// Browser-Test Sicherung: doppelte Kopie, IndexedDB-Spiegel, Sicherungsdatei speichern/laden, Hinweis in der Versionsanzeige.
// Aufruf: node tools/e2e-sicherung.mjs
import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");
const root = path.resolve("public");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json" };
const srv = http.createServer((q, r) => {
  const f = path.join(root, q.url === "/" ? "index.html" : q.url.split("?")[0]);
  fs.readFile(f, (e, d) => (e ? (r.writeHead(404), r.end()) : (r.writeHead(200, { "content-type": types[path.extname(f)] || "text/plain" }), r.end(d))));
}).listen(0);
const url = `http://localhost:${srv.address().port}/`;
let fails = 0;
const check = (c, m) => { if (!c) { fails++; console.log("FAIL", m); } else console.log("ok  ", m); };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1180, height: 820 }, serviceWorkers: "block", acceptDownloads: true });
await ctx.addInitScript(() => { window.__EMMA_TEST = { noSW: true, noFocus: true }; });
const p = await ctx.newPage();
p.errors = [];
p.on("pageerror", (e) => p.errors.push(String(e)));
p.on("dialog", (d) => d.accept());
const boot = async () => { await p.goto(url); await p.waitForSelector(".topics"); };
const xp = () => p.evaluate(() => window.__EMMA.S.xp);
const ver = async () => (await p.textContent("#ver")).trim();
await boot();

// 1) Anfang: Hinweis, dass es noch keine Sicherung gibt, amber
check(/^Version \d+ · noch keine Sicherung$/.test(await ver()) && await p.evaluate(() => document.getElementById("ver").classList.contains("old")), "Anfang: „noch keine Sicherung“, amber: " + await ver());
check(await p.evaluate(() => getComputedStyle(document.getElementById("ver")).pointerEvents) !== "none", "Versionsanzeige ist antippbar");

// 2) Speichern schreibt zwei Kopien
await p.evaluate(() => { window.__EMMA.S.xp = 77; window.__EMMA.save(); });
let keys = await p.evaluate(() => [localStorage.getItem("capy-mathe-v1"), localStorage.getItem("capy-mathe-v1-bak")]);
check(keys[0] && keys[0] === keys[1] && JSON.parse(keys[0]).xp === 77, "Hauptschlüssel und zweite Kopie gleich");
await p.waitForTimeout(400);

// 3) Hauptschlüssel kaputt -> Stand kommt aus der zweiten Kopie, Defektes bleibt aufgehoben
// (auf einer Leerseite desselben Ursprungs ändern, sonst überschreibt pagehide der App die Änderung)
await p.goto(url + "leer"); await p.evaluate(() => localStorage.setItem("capy-mathe-v1", "{kaputt"));
await boot();
check(await xp() === 77, "Hauptschlüssel kaputt: Punkte kommen aus der zweiten Kopie");
check(await p.evaluate(() => localStorage.getItem("capy-mathe-v1-defekt") === "{kaputt"), "Kaputter Stand wird aufgehoben statt gelöscht");

// 4) beide Kopien weg -> Wiederherstellung aus IndexedDB
await p.goto(url + "leer");
await p.evaluate(() => { localStorage.removeItem("capy-mathe-v1"); localStorage.removeItem("capy-mathe-v1-bak"); sessionStorage.removeItem("capy-restored"); });
await boot();
await p.waitForFunction(() => window.__EMMA.S.xp === 77, null, { timeout: 5000 }).catch(() => {});
check(await xp() === 77, "Beide Kopien weg: Punkte kommen aus IndexedDB zurück");

// 5) Schließen/Tab-Wechsel sichert noch einmal
await p.evaluate(() => { window.__EMMA.S.xp = 99; window.dispatchEvent(new Event("pagehide")); });
check(await p.evaluate(() => JSON.parse(localStorage.getItem("capy-mathe-v1")).xp) === 99, "pagehide speichert den neuesten Stand");

// 6) Sicherungsdatei speichern
await p.click('[data-act="settings"]'); await p.waitForSelector(".settings");
check(/noch keine/.test(await p.textContent(".settings")), "Einstellungen: noch keine Sicherungsdatei");
const [dl] = await Promise.all([p.waitForEvent("download"), p.click('[data-act="backup"]')]);
const file = path.join(os.tmpdir(), "capy-test-sicherung.json");
await dl.saveAs(file);
const saved = JSON.parse(fs.readFileSync(file, "utf8"));
check(/^capy-sicherung-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()) && saved.xp === 99 && saved.lastBackup > 0, "Datei heißt capy-sicherung-Datum.json und enthält den Stand: " + dl.suggestedFilename());
check(/^Version \d+ · gesichert ✓$/.test(await ver()) && !(await p.evaluate(() => document.getElementById("ver").classList.contains("old"))), "Nach dem Sichern: „gesichert ✓“, nicht mehr amber");

// 7) Sicherung 4 Tage alt -> Hinweis
await p.evaluate(() => { window.__EMMA.S.lastBackup = Date.now() - 4 * 864e5; window.__EMMA.render(); });
check(/Sicherung vor 4 T\./.test(await ver()) && await p.evaluate(() => document.getElementById("ver").classList.contains("old")), "Nach 4 Tagen: „Sicherung vor 4 T.“ amber");

// 8) Sicherung laden (anderer Stand), danach Neuladen
fs.writeFileSync(file, JSON.stringify(Object.assign(saved, { xp: 555 })));
await Promise.all([p.waitForNavigation(), p.setInputFiles("#bkfile", file)]);
await p.waitForSelector(".topics");
check(await xp() === 555, "Sicherung laden: Punkte 555 sind zurück");
await p.waitForTimeout(300);
await p.reload(); await p.waitForSelector(".topics");
check(await xp() === 555, "… und bleiben nach dem Neuladen (pagehide überschreibt nicht)");

// 9) Falsche Datei wird abgelehnt, Stand bleibt
await p.click('[data-act="settings"]'); await p.waitForSelector(".settings");
const bad = path.join(os.tmpdir(), "capy-test-falsch.json"); fs.writeFileSync(bad, JSON.stringify({ hallo: "welt" }));
await p.setInputFiles("#bkfile", bad);
await p.waitForSelector(".toast");
check(/keine Sicherung/.test(await p.textContent(".toast")) && await xp() === 555, "Falsche Datei: Hinweis, Stand bleibt");
const bad2 = path.join(os.tmpdir(), "capy-test-text.json"); fs.writeFileSync(bad2, "das ist kein json");
await p.setInputFiles("#bkfile", bad2);
await p.waitForTimeout(300);
check(await xp() === 555, "Datei ohne gültiges JSON: Stand bleibt");

// 10) Zurücksetzen warnt und räumt trotzdem nicht die Sicherungsdatei weg
check(await p.evaluate(() => !!document.querySelector('[data-act="reset"]')), "Zurücksetzen bleibt in den Einstellungen");
check(p.errors.length === 0, "ohne Fehler " + p.errors.join("|"));
await b.close(); srv.close();
console.log(fails ? `${fails} Fehler` : "alle Sicherungs-Tests ok");
process.exit(fails ? 1 : 0);
