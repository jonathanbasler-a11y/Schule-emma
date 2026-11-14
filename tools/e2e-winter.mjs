// Browser-Test Winter-Design und Garderobe: Schnee, Orte, Outfits anziehen, Freischalten, Jahreszeit, Layout.
// Aufruf: node tools/e2e-winter.mjs [Ordner für Screenshots]
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
async function open(size = { width: 1180, height: 820 }, opts = {}) {
  const ctx = await b.newContext(Object.assign({ viewport: size, hasTouch: true, serviceWorkers: "block" }, opts.ctx || {}));
  await ctx.addInitScript(() => { window.__EMMA_TEST = { noSW: true, roundLen: 3, noFocus: true }; });
  const p = await ctx.newPage();
  p.errors = [];
  p.on("pageerror", (e) => p.errors.push(String(e)));
  p.on("console", (m) => m.type() === "error" && p.errors.push(m.text()));
  p.on("dialog", (d) => d.accept());
  await p.goto(url);
  await p.waitForSelector(".topics");
  return { ctx, p };
}
const shot = async (p, n, full) => { if (shots) await p.screenshot({ path: path.join(shots, "winter-" + n + ".png"), fullPage: !!full }); };
const S = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__EMMA.S)));

// 1) Winter ist Standard: Farben, Schnee, Ort, Mütze, Flocken als Währung
{
  const { ctx, p } = await open();
  check(await p.evaluate(() => document.documentElement.dataset.season) === "winter", "Jahreszeit Winter ist Standard");
  check(await p.locator("#snow i").count() === 26 && await p.evaluate(() => getComputedStyle(document.getElementById("snow")).pointerEvents) === "none", "Schneefall (26 Flocken) blockiert keine Taps");
  const st = await S(p);
  check(st.scene === "onsenschnee" && st.wear.includes("bommel"), "Startort: Onsen im Schnee, Mochi trägt Bommelmütze");
  check(/❄️/.test(await p.textContent(".topr")), "Punkte heißen Schneeflocken ❄️");
  check(await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()) === "#eef4fb" || await p.evaluate(() => document.documentElement.dataset.theme) === "dark", "Winter-Farben aktiv");
  check(/^Version \d+/.test((await p.textContent("#ver")).trim()), "Versionsnummer sichtbar: " + (await p.textContent("#ver")));
  await shot(p, "start");
  check(p.errors.length === 0, "Start ohne Fehler " + p.errors.join("|"));
  await ctx.close();
}

// 2) Orte und Outfits: viele frei, ein Teil pro Platz, Sperre bei zu wenig Punkten
{
  const { ctx, p } = await open();
  await p.click('[data-act="cozy"]');
  await p.waitForSelector(".cozy");
  const nOut = await p.locator('.cozy .pick[data-act="wear"]').count(), nLock = await p.locator(".cozy .pick.lock").count();
  check(nOut >= 40, `Outfits gleich zum Anfang frei: ${nOut} (gesperrt: ${nLock})`);
  check(await p.locator('.cozy .pick[data-act="scene"]').count() >= 8, "viele Orte frei");
  const heads = (await p.locator(".cozy h2.sec").allTextContents()).join("|");
  check(/Mützen/.test(heads) && /Schmuck/.test(heads) && /Kleidung/.test(heads) && /Freunde/.test(heads), "Bereiche: Mützen, Schmuck, Kleidung, Freunde …");
  await shot(p, "cozy", true);
  // zwei Mützen: die zweite ersetzt die erste
  await p.click('.cozy .pick[data-v="krone"]');
  await p.click('.cozy .pick[data-v="elfenhut"]');
  let w = (await S(p)).wear;
  check(w.includes("elfenhut") && !w.includes("krone") && !w.includes("bommel"), "zweite Mütze ersetzt die erste");
  await p.click('.cozy .pick[data-v="sternkette"]'); await p.click('.cozy .pick[data-v="norweger"]'); await p.click('.cozy .pick[data-v="kakao"]');
  w = (await S(p)).wear;
  check(["elfenhut", "sternkette", "norweger", "kakao"].every((x) => w.includes(x)), "Mütze, Kette, Pulli und Kakao zusammen");
  await p.click('.cozy .pick[data-v="schneemann"]'); await p.click('.cozy .pick[data-v="pinguin"]');
  w = (await S(p)).wear;
  check(w.includes("schneemann") && w.includes("pinguin"), "mehrere Freunde gleichzeitig");
  check(await p.locator(".cozy .preview svg.mochi").count() === 1, "Vorschau zeigt Mochi");
  await shot(p, "outfit");
  // gesperrtes Teil
  const locked = await p.evaluate(() => window.Capy.OUTFITS.find((o) => o.xp > 0).id);
  await p.click(`.cozy .pick[data-v="${locked}"]`, { force: true });
  check(!(await S(p)).wear.includes(locked) && await p.locator(".toast").count() >= 1, "Gesperrtes Teil bleibt aus, Mochi erklärt warum");
  // freischalten durch Punkte
  await p.evaluate(() => { window.__EMMA.S.xp = 1000; window.__EMMA.save(); window.__EMMA.render(); });
  check(await p.locator('.cozy .pick[data-act="locked"]').count() === 0, "mit 1000 Punkten ist alles frei");
  await p.click(`.cozy .pick[data-v="${locked}"]`);
  check((await S(p)).wear.includes(locked), "freigeschaltetes Teil lässt sich anziehen");
  // alles ausziehen, Überraschung
  await p.click('[data-act="nackt"]');
  check((await S(p)).wear.length === 0, "Alles ausziehen");
  for (let i = 0; i < 6; i++) await p.click('[data-act="zufall"]');
  const ids = (await S(p)).wear, slots = await p.evaluate((ids) => ids.map((id) => window.Capy.SLOT_OF[id]), ids);
  check(ids.every((x) => typeof x === "string") && slots.filter((s) => s !== "begleiter").length === new Set(slots.filter((s) => s !== "begleiter")).size, "Überrasch-mich: höchstens ein Teil pro Bereich");
  // Ort wechseln und merken
  await p.click('.cozy .pick[data-v="huette"]');
  await p.reload(); await p.waitForSelector(".topics");
  check((await S(p)).scene === "huette", "Ort bleibt nach dem Neuladen");
  check(p.errors.length === 0, "Orte & Outfits ohne Fehler " + p.errors.join("|"));
  await ctx.close();
}

// 3) Einstellungen: Schnee aus, Jahreszeit Herbst
{
  const { ctx, p } = await open();
  await p.click('[data-act="settings"]');
  await p.uncheck('[data-set="snow"]');
  check(await p.locator("#snow").count() === 0, "Schneefall lässt sich ausschalten");
  await p.check('[data-set="snow"]');
  check(await p.locator("#snow").count() === 1, "… und wieder einschalten");
  await p.selectOption('[data-set="season"]', "herbst");
  check(await p.evaluate(() => document.documentElement.dataset.season) === "herbst" && await p.locator("#snow").count() === 0 && /🍂/.test(await p.textContent(".topr")), "Herbst: Blätter 🍂, kein Schnee");
  await p.selectOption('[data-set="season"]', "winter");
  check(/❄️/.test(await p.textContent(".topr")), "Zurück zum Winter");
  await ctx.close();
}

// 4) Wer weniger Bewegung möchte: kein Schnee
{
  const { ctx, p } = await open({ width: 1180, height: 820 }, { ctx: { reducedMotion: "reduce" } });
  check(await p.evaluate(() => getComputedStyle(document.getElementById("snow")).display) === "none", "Weniger Bewegung: Schnee ist ausgeblendet");
  await ctx.close();
}

// 5) Alter Spielstand: bekommt einmal Winter, behält Punkte, Fehlerkiste und Sticker
{
  const ctx = await b.newContext({ viewport: { width: 1180, height: 820 }, serviceWorkers: "block" });
  await ctx.addInitScript(() => {
    window.__EMMA_TEST = { noSW: true };
    if (!sessionStorage.getItem("seed")) { sessionStorage.setItem("seed", "1"); localStorage.setItem("capy-mathe-v1", JSON.stringify({ v: 1, xp: 321, scene: "tee", wear: ["muetze", "schal", "gibtesnicht"], stickers: ["start"], box: [], exams: [], gens: {}, days: {}, flags: {}, set: { date: "2026-11-09", examMin: 45, key: [92, 80, 65, 50, 25], theme: "hell" }, stats: { tasks: 12, ok: 9, help: 1 } })); }
  });
  const p = await ctx.newPage();
  await p.goto(url); await p.waitForSelector(".topics");
  const st = await S(p);
  check(st.xp === 321 && st.stickers.includes("start") && st.stats.tasks === 12, "Punkte, Sticker und Statistik bleiben erhalten");
  check(st.scene === "onsenschnee" && st.set.season === "winter" && !st.wear.includes("gibtesnicht"), "Ort wird Winter, unbekannte Teile verschwinden");
  check(st.wear.includes("muetze") && st.wear.includes("schal"), "getragene Teile bleiben");
  await p.reload(); await p.waitForSelector(".topics");
  check((await S(p)).flags.winter1 === true, "Winter-Umstellung nur einmal");
  await ctx.close();
}

// 6) Layout: Hochformat und Handy
for (const [name, size] of [["iPad hoch", { width: 820, height: 1180 }], ["Handy", { width: 390, height: 844 }]]) {
  const { ctx, p } = await open(size);
  check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: Start ohne seitliches Scrollen`);
  await p.click('[data-act="cozy"]'); await p.waitForSelector(".cozy");
  check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: Orte & Outfits ohne seitliches Scrollen`);
  const prev = await p.locator(".cozy .preview svg.mochi").boundingBox();
  check(prev && prev.width >= 100 && prev.x >= 0 && prev.x + prev.width <= size.width, `${name}: Mochi in der Vorschau sichtbar`);
  if (name === "Handy") await shot(p, "handy", false);
  await ctx.close();
}

await b.close(); srv.close();
console.log(fails ? `${fails} Fehler` : "alle Winter-Tests ok");
process.exit(fails ? 1 : 0);
