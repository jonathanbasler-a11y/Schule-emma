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
const OB = O.filter((o) => !o.theme), SB = S.filter((o) => !o.theme), OT = O.filter((o) => o.theme), ST = S.filter((o) => o.theme);
const free = O.filter((o) => o.xp === 0);
ok(free.length >= 8 && free.length <= 16 && free.every((o) => !o.theme), "nur ein kleiner Startsatz ist frei: " + free.length + " von " + O.length);
ok(slots.every((sl) => free.some((o) => o.slot === sl)), "in jedem Bereich ist etwas frei");
ok(slots.filter((sl) => O.filter((o) => o.slot === sl).length >= 3).length >= 7, "mindestens 3 Teile in den meisten Bereichen");
ok(SB.filter((s) => s.xp === 0).length >= 3 && SB.filter((s) => s.xp === 0).length <= 5, "ein paar Orte von Anfang an frei");
ok(Math.max(...OB.map((o) => o.xp)) <= 1500 && Math.max(...SB.map((o) => o.xp)) <= 1500, "Grundteile bleiben erreichbar (höchstens 1500)");
// langsam und gleichmäßig: nie viele Teile auf einmal, die ersten kommen nach ca. 30 Punkten (3 richtige Aufgaben)
{
  const xs = OB.filter((o) => o.xp > 0).map((o) => o.xp).sort((a, b) => a - b);
  ok(xs[0] >= 30 && xs[0] <= 60, "das erste neue Teil kommt nach etwa 3 richtigen Aufgaben: " + xs[0]);
  ok(xs.every((v, i) => i === 0 || v - xs[i - 1] <= 100), "keine großen Lücken beim Freischalten");
  ok(OB.filter((o) => o.xp > 0 && o.xp <= 300).length <= 12, "in den ersten 300 Punkten höchstens 12 neue Teile");
}

// ---- Themen-Sets: 100 neue Teile und 10 neue Orte, nach Datum und ab dem Punktestand beim Update ----
ok(C.THEMES.length === 5 && OT.length === 100 && ST.length === 10, `5 Sets, 100 neue Teile, 10 neue Orte: ${C.THEMES.length}/${OT.length}/${ST.length}`);
ok(C.THEMES.every((t) => /^\d{4}-\d{2}-\d{2}$/.test(t.from) && OT.filter((o) => o.theme === t.id).length === 20 && ST.filter((o) => o.theme === t.id).length === 2), "jedes Set: 20 Teile, 2 Orte, Datum");
ok(C.THEMES.every((t, i) => i === 0 || t.from > C.THEMES[i - 1].from), "Sets kommen nacheinander");
ok(new Set(OT.map((o) => o.name)).size === OT.length, "Namen der neuen Teile sind einmalig");
for (const o of OT) {
  const base = o.id.slice(0, o.id.lastIndexOf("_"));
  ok(C.mochi("calm", [o.id], 150) !== C.mochi("calm", [base], 150), "Set-Teil hat andere Farben als das Grundteil: " + o.id);
  ok(o.slot === C.SLOT_OF[base] && o.d > 0 && o.from, "Set-Teil: Platz, Punkte, Datum " + o.id);
}
for (const o of ST) ok(C.scene(o.id) !== C.scene(o.id.slice(0, o.id.lastIndexOf("_"))), "Set-Ort hat andere Farben: " + o.id);
// Punkte zählen ab dem Stand beim Update
C.rebase(0);
ok(Math.min(...OT.map((o) => o.xp)) <= 100 && Math.max(...OT.map((o) => o.xp)) <= 7000, "Neue Sets von 0 an: erstes Teil früh, letztes erreichbar");
C.rebase(3000);
ok(OT.every((o) => o.xp >= 3050) && ST.every((o) => o.xp >= 3000) && OB.every((o) => o.xp <= 1500), "Mit 3000 Punkten beim Update ist von den neuen Sets nichts frei, Altes bleibt frei");
C.rebase(0);
const dxs = OT.concat(ST).map((o) => o.d).sort((a, b) => a - b);
ok(dxs.every((v, i) => i === 0 || v - dxs[i - 1] <= 300), "gleichmäßig verteilt, keine großen Lücken");
// Orte
for (const s of S) {
  const svg = C.scene(s.id);
  ok(svg.length > 300 && wellFormed(svg) === "", `Ort gültig: ${s.id} ${wellFormed(svg)}`);
}
ok(C.scene("gibtesnicht") !== undefined, "unbekannter Ort bricht nicht");
console.log(`Garderobe ok (${n} Prüfungen)`);
