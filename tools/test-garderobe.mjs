// Prüft Mochis Garderobe und die Orte: jedes Teil gehört zu einem Platz, die Zeichnungen sind sauber (Tags, Koordinaten),
// pro Platz kann nur ein Teil getragen werden, und am Anfang sind viele Sachen frei.
// Aufruf: node tools/test-garderobe.mjs
import assert from "node:assert/strict";
import { createRequire } from "node:module";
globalThis.self = globalThis;
const req = createRequire(import.meta.url);
req("../public/capy.js");
req("../public/garderobe.js");
const C = globalThis.Capy;
let n = 0;
const ok = (c, m) => { n++; assert.ok(c, m); };

// einfache XML-Prüfung: Tags paarweise, Anführungszeichen gerade
function wellFormed(svg) {
  const stack = [];
  for (const m of svg.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g)) {
    const [, close, name, attrs, self] = m;
    if ((attrs.match(/"/g) || []).length % 2) return "Anführungszeichen: " + m[0].slice(0, 60);
    if (self) continue;
    if (close) { if (stack.pop() !== name) return "Tag schließt falsch: " + name; } else stack.push(name);
  }
  return stack.length ? "offene Tags: " + stack.join(",") : "";
}
const inRange = (svg) => {
  for (const m of svg.matchAll(/\b(?:cx|cy|x|y|x1|x2|y1|y2)="(-?[\d.]+)"/g)) { const v = Number(m[1]); if (v < -30 || v > 230) return m[0]; }
  for (const m of svg.matchAll(/\bd="([^"]+)"/g)) for (const num of m[1].match(/-?\d+(?:\.\d+)?/g) || []) { const v = Number(num); if (v < -60 || v > 260) return "Pfad " + num; }
  return "";
};

const O = C.OUTFITS, S = C.SCENES, slots = C.SLOTS.map(([id]) => id);
ok(O.length >= 50, "viele Outfit-Teile: " + O.length);
ok(new Set(O.map((o) => o.id)).size === O.length, "Teile einmalig");
ok(new Set(S.map((o) => o.id)).size === S.length && S.length >= 12, "Orte einmalig und viele: " + S.length);
ok(O.every((o) => o.name && o.name.length >= 3 && slots.includes(o.slot) && Number.isFinite(o.xp) && o.xp >= 0), "jedes Teil: Name, Platz, Freischaltung");
const base = C.mochi("calm", [], 150);
ok(wellFormed(base) === "", "Mochi ohne Teile gültig");
for (const o of O) {
  const svg = C.mochi("calm", [o.id], 150);
  ok(svg !== base, "Teil wird gezeichnet: " + o.id);
  const bad = wellFormed(svg);
  ok(bad === "", `Zeichnung gültig: ${o.id} ${bad}`);
  ok(inRange(svg) === "", `Koordinaten im Bild: ${o.id} ${inRange(svg)}`);
  ok((svg.match(/<svg/g) || []).length === 1, "genau ein svg: " + o.id);
}
// alles gleichzeitig (ein Teil je Platz) bleibt gültig
{
  let w = [];
  for (const [sl] of C.SLOTS) w = C.toggleWear(w, O.find((o) => o.slot === sl).id);
  const svg = C.mochi("proud", w, 150);
  ok(wellFormed(svg) === "" && w.length === slots.length, "ein Teil je Platz zusammen gültig");
}
// ein Teil pro Platz
{
  const huts = O.filter((o) => o.slot === "hut");
  let w = C.toggleWear([], huts[0].id);
  w = C.toggleWear(w, huts[1].id);
  ok(w.length === 1 && w[0] === huts[1].id, "zweite Mütze ersetzt die erste");
  ok(C.toggleWear(w, huts[1].id).length === 0, "nochmal tippen zieht es aus");
  const fr = O.filter((o) => o.slot === "begleiter");
  ok(fr.length >= 3 && C.toggleWear(C.toggleWear([], fr[0].id), fr[1].id).length === 2, "mehrere Freunde gleichzeitig");
  const a = O.find((o) => o.slot === "hals").id, b = O.find((o) => o.slot === "schmuck").id;
  ok(C.toggleWear(C.toggleWear([], a), b).length === 2, "Schal und Kette zusammen");
}
// Anfang: viel ist schon frei
const free = O.filter((o) => o.xp === 0);
ok(free.length >= 40, "von Anfang an frei: " + free.length + " von " + O.length);
ok(slots.every((sl) => free.some((o) => o.slot === sl)), "in jedem Bereich ist etwas frei");
ok(slots.filter((sl) => O.filter((o) => o.slot === sl).length >= 3).length >= 7, "mindestens 3 Teile in den meisten Bereichen");
ok(S.filter((s) => s.xp === 0).length >= 8, "viele Orte von Anfang an frei");
ok(Math.max(...O.map((o) => o.xp)) <= 400 && Math.max(...S.map((o) => o.xp)) <= 400, "Freischaltungen bleiben erreichbar (höchstens 400)");
// Orte
for (const s of S) {
  const svg = C.scene(s.id);
  ok(svg.length > 300 && wellFormed(svg) === "", `Ort gültig: ${s.id} ${wellFormed(svg)}`);
}
ok(C.scene("gibtesnicht") !== undefined, "unbekannter Ort bricht nicht");
console.log(`Garderobe ok (${n} Prüfungen)`);
