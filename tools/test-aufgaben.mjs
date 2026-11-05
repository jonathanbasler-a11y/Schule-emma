// Prüft alle Aufgaben-Generatoren: richtige Lösung wird angenommen, Nachbarwerte nicht.
// Aufruf: node tools/test-aufgaben.mjs [Anzahl pro Generator und Stufe]
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const A = createRequire(import.meta.url)("../public/aufgaben.js");
const N = Number(process.argv[2] || 300);

// ---- Hilfsfunktionen ----
assert.equal(A.fmt(1250), "1250");
assert.equal(A.fmt(12547), "12 547");
assert.equal(A.parseNum("12 547"), 12547);
assert.equal(A.parseNum("12.547"), 12547);
assert.ok(Number.isNaN(A.parseNum("12a")));
const words = {
  0: "null", 1: "eins", 21: "einundzwanzig", 101: "einhunderteins", 1001: "eintausendeins", 39501: "neununddreißigtausendfünfhunderteins",
  410097: "vierhundertzehntausendsiebenundneunzig", 18005003: "achtzehn Millionen fünftausenddrei", 1000000: "eine Million",
  3100000: "drei Millionen einhunderttausend", 22005702311: "zweiundzwanzig Milliarden fünf Millionen siebenhundertzweitausenddreihundertelf",
};
for (const [n, w] of Object.entries(words)) assert.equal(A.zahlwort(Number(n)), w, n);
// Zahlwörter lesen, auch mit Varianten aus dem Buch
for (const [w, n] of [["einhundertneuntausendvierhundertsechzehn", 109416], ["hundertneuntausendvierhundertsechzehn", 109416], ["zweitausendsechshundertsiebzehn", 2617], ["sechs Milliarden sechs Millionen sechstausendsechshundertsechs", 6006006606], ["neunhundertsiebenundzwanzig Millionen dreihundertfünftausendvierhundertzwölf", 927305412], ["Eine Million", 1e6], ["dreißig", 30], ["dreissig", 30], ["achtzehnmillionenfünftausenddrei", 18005003]]) assert.equal(A.wortZuZahl(w), n, w);
for (let i = 0; i < 5000; i++) { const n = Math.floor(Math.random() * 1e13); assert.equal(A.wortZuZahl(A.zahlwort(n)), n, String(n)); }
assert.ok(Number.isNaN(A.wortZuZahl("zweiundzwanzigquatsch")));
// Römisch
assert.equal(A.toRoman(1694), "MDCXCIV");
assert.equal(A.toRoman(977), "CMLXXVII");
assert.equal(A.fromRoman("MCCCCXLIX"), 1449);
assert.equal(A.fromRoman("MDCCLXXVI"), 1776);
for (let n = 1; n < 4000; n++) assert.equal(A.fromRoman(A.toRoman(n)), n);
assert.ok(!A.romanValid("IIII") && !A.romanValid("IC") && A.romanValid("XLIX"));
// Zweiersystem
assert.equal(A.parseBin("(10011)2"), 19);
assert.equal(A.parseBin("10110"), 22);
assert.equal(A.toBin(25), "11001");
// Runden
assert.equal(A.roundTo(39960, 100), 40000);
assert.equal(A.roundTo(35761, 1000), 36000);
assert.equal(A.roundTo(35261, 1000), 35000);
// Überschlag: frei gewählte glatte Zahlen, nah genug
assert.ok(A.ueOk("22000 + 9000 = 31000", 21798 + 9608));
assert.ok(A.ueOk("20000 + 10000", 21798 + 9608));
assert.ok(A.ueOk("31000", 31406));
assert.ok(A.ueOk("200 · 300 = 60000", 179 * 314));
assert.ok(A.ueOk("5000 + 101000 + 1000 = 107000", 4807 + 100700 + 904));
assert.ok(!A.ueOk("31406", 31406), "genau ausgerechnet ist kein Überschlag");
assert.ok(!A.ueOk("50000", 31406), "zu weit weg");
// Noten
assert.equal(A.note(100).txt, "1");
assert.equal(A.note(92).txt, "1−");
assert.equal(A.note(78).n, 3);
assert.equal(A.note(10).txt, "6");
// Division in Schritten (Buch S. 28)
assert.deepEqual([A.divSteps(3247, 24).q, A.divSteps(3247, 24).r], [135, 7]);
assert.deepEqual([A.divSteps(4635, 15).q, A.divSteps(4635, 15).r], [309, 0]);
assert.deepEqual([A.divSteps(8550, 57).q, A.divSteps(8550, 57).r], [150, 0]);

// ---- Musterlösung für jede Eingabeart ----
const nf = (s) => String(s).replace(/[ \s]/g, "");
function rightInput(t) {
  switch (t.kind) {
    case "num": return t.withRest ? { q: nf(t.answer.split(" Rest ")[0]), r: (t.answer.split(" Rest ")[1] || "") } : nf(t.answer);
    case "text": return t.answer;
    case "choice": case "cmp": return t.options.indexOf(t.answer);
    case "cells": case "holes": case "mauer": case "kette": return t.cells.map((c) => c.ans);
    case "written": return { res: String(t.res), rest: String(t.rest || ""), ue: "" };
    case "place": return t.target;
    case "order": return t.items.slice().sort((a, b) => a - b);
  }
  throw new Error("Unbekannte Art " + t.kind);
}
function wrongInput(t, right) {
  switch (t.kind) {
    case "num": return t.withRest ? { q: String(Number(right.q) + 1), r: right.r } : String(Number(right) + 1);
    case "text": return t.answer + "1";
    case "choice": case "cmp": return (right + 1) % t.options.length;
    case "cells": case "holes": case "mauer": case "kette": return right.map((v, i) => (i === 0 ? String((Number(v) + 1)) : v));
    case "written": return { res: String(t.res + 1), rest: right.rest, ue: "" };
    case "place": return t.target + t.line.step;
    case "order": return right.slice().reverse();
  }
}
let count = 0;
const kinds = {};
for (const g of Object.values(A.G)) {
  for (const lvl of g.lvls) {
    for (let i = 0; i < N; i++) {
      const seed = (i * 7919 + lvl * 104729 + g.id.length * 31) >>> 0;
      let t;
      try { t = A.make(g.id, lvl, seed); } catch (e) { throw new Error(`${g.id} Stufe ${lvl} seed ${seed}: ${e.stack}`); }
      kinds[t.kind] = (kinds[t.kind] || 0) + 1;
      const where = `${g.id} L${lvl} #${seed}`;
      assert.ok(t.q && typeof t.q === "string", where + " ohne Frage");
      assert.ok(!/undefined|NaN|\[object/.test(t.q), where + " Frage kaputt: " + t.q.slice(0, 200));
      assert.ok(!/undefined|NaN|\[object/.test(t.solution || ""), where + " Lösung kaputt: " + (t.solution || "").slice(0, 300));
      assert.ok(Array.isArray(t.hints) && t.hints.length >= 1, where + " ohne Hilfe");
      assert.ok(t.hints.every((h) => !/undefined|NaN/.test(h)), where + " Hilfe kaputt: " + t.hints.join(" | "));
      const right = rightInput(t);
      const rc = t.check(right);
      assert.ok(rc.ok, `${where} richtige Antwort abgelehnt: ${JSON.stringify(right)} | ${t.answer}`);
      if (t.kind === "choice" || t.kind === "cmp") {
        assert.ok(t.options.length >= 2 && new Set(t.options).size === t.options.length, where + " doppelte Auswahl " + t.options.join("|"));
        assert.ok(t.correct >= 0, where + " richtige Antwort fehlt in der Auswahl");
      }
      if (t.kind === "order") assert.equal(new Set(t.items).size, t.items.length, where + " doppelte Zahlen beim Ordnen");
      const w = wrongInput(t, right);
      if (t.kind !== "order" || t.items.length > 1) assert.ok(!t.check(w).ok, `${where} falsche Antwort angenommen: ${JSON.stringify(w)}`);
      count++;
    }
  }
}

// ---- Inhalte genauer prüfen ----
for (let i = 0; i < 500; i++) {
  const t = A.make("schrift.div", 1 + (i % 3), i + 1);
  assert.equal(t.res * t.nums[1] + t.rest, t.nums[0]);
  assert.ok(t.rest < t.nums[1]);
  const m = A.make("schrift.mul", 1 + (i % 3), i + 1);
  assert.equal(m.res, m.nums[0] * m.nums[1]);
  assert.ok(m.nums[1] >= 2, "Multiplikation mit 0 oder 1 ist keine schriftliche Aufgabe");
  const s = A.make("schrift.sub", 1 + (i % 3), i + 1);
  assert.ok(s.res > 0 && s.nums[0] > s.nums[1]);
  const k = A.make("platz.kette", 1 + (i % 3), i + 1);
  assert.ok(k.cells.every((c) => Number.isInteger(Number(c.ans)) && Number(c.ans) >= 0), "Rechenkette mit Bruch oder Minus");
  const ma = A.make("platz.mauer", 1 + (i % 3), i + 1);
  assert.ok(ma.cells.length >= 1);
  const rg = A.make("runden.grenzen", 1 + (i % 3), i + 1);
  const [lo, hi] = rg.cells.map((c) => Number(c.ans));
  assert.equal(A.roundTo(lo, hi - lo + 1), A.roundTo(hi, hi - lo + 1));
}
// Die Aufgaben aus dem Heft sind mit der App-Logik lösbar
assert.deepEqual([A.divSteps(14432, 16).q, A.divSteps(14432, 16).r], [902, 0]);
assert.deepEqual([A.divSteps(8821, 13).q, A.divSteps(8821, 13).r], [678, 7]);
assert.equal(A.parseBin("110111") + A.parseBin("10111"), 78);
assert.equal(809 * 27, 21843);

// Probearbeit
for (let s = 1; s <= 50; s++) {
  const P = A.probearbeit(s);
  assert.equal(P.length, 10);
  const pts = P.reduce((a, x) => a + x.tasks.reduce((b, t) => b + t.pts, 0), 0);
  assert.ok(pts >= 35 && pts <= 50, "Punkte der Probearbeit: " + pts);
}
console.log(`aufgaben ok: ${count} Aufgaben aus ${Object.keys(A.G).length} Generatoren`, JSON.stringify(kinds));
