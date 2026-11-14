// Prüft den Bereich Naturwissenschaften: richtige Antwort wird angenommen, falsche nicht, und die Inhalte werden
// unabhängig gegen eigene Daten (Abstände, Durchmesser, Rechnungen, Zeichnungen) nachgeprüft.
// Aufruf: node tools/test-nw.mjs [Anzahl Zufallswerte je Generator und Stufe]
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
const A = req("../public/aufgaben.js");
const N = req("../public/nw.js");
const COUNT = Number(process.argv[2] || 200);
let n = 0;
const ok = (c, m) => { n++; assert.ok(c, m); };

// ---- Daten: Reihenfolge, Größe, Merksatz ----
ok(N.PLANETEN.length === 8, "acht Planeten");
ok(N.PLANETEN.every((p, i) => i === 0 || N.ABSTAND[p] > N.ABSTAND[N.PLANETEN[i - 1]]), "Planeten stehen nach Abstand zur Sonne");
ok(N.MERKSATZ.length === 8 && N.MERKSATZ.every((w, i) => w[0].toUpperCase() === N.PLANETEN[i][0]), "Merksatz: Anfangsbuchstaben passen zu den Planeten");
ok(N.GROESSE.every((p, i) => i === 0 || N.DURCHMESSER[p] <= N.DURCHMESSER[N.GROESSE[i - 1]]), "Größenreihenfolge nach Durchmesser");
ok(N.GROESSE[0] === "Jupiter" && N.GROESSE[1] === "Saturn" && N.GROESSE[2] === "Uranus" && N.GROESSE[7] === "Merkur", "Jupiter, Saturn, Uranus, … Merkur");
// Steckbriefe: jeder Hinweis nennt genau den richtigen Planeten
const stk = (re) => N.STECK.filter(([, c]) => re.test(c));
ok(stk(/ist der größte Planet/).every(([p]) => p === N.GROESSE[0]), "größter Planet");
ok(stk(/zweitgrößte/).every(([p]) => p === N.GROESSE[1]) && stk(/drittgrößte/).every(([p]) => p === N.GROESSE[2]), "zweit- und drittgrößter Planet");
ok(stk(/kleinste/).every(([p]) => p === N.GROESSE[7]), "kleinster Planet");
ok(stk(/der Sonne am nächsten/).every(([p]) => p === N.PLANETEN[0]), "Sonne am nächsten");
ok(stk(/kälteste/).every(([p]) => p === N.PLANETEN.slice().sort((a, b) => N.ABSTAND[b] - N.ABSTAND[a])[0]), "kältester Planet ist der entfernteste");
ok(new Set(N.STECK.map(([, c]) => c)).size === N.STECK.length, "Hinweise einmalig");
ok(N.PLANETEN.every((p) => N.STECK.some(([q]) => q === p)), "jeder Planet hat Hinweise");
ok(N.norm("Äquator") === N.norm("Aequator") && N.norm("Grünwich") === N.norm("Gruenwich"), "Schreibweisen mit Umlauten werden gleich behandelt");
// Zeit und Strecke der ISS: 16 Sonnenaufgänge in 24 Stunden passen zu 90 Minuten je Umrundung
ok((24 * 60) / 90 === 16 + 0 && Number.isInteger((24 * 60) / 90) === false ? true : (24 * 60) / 90 > 15, "24 Stunden sind etwa 16 Umrundungen");
ok(Math.round((24 * 60) / 90) === 16, "Rundung: 1440 : 90 = 16");

// ---- Alle Aufgaben: lösbar, Nachbarwerte nicht, Hinweise vorhanden ----
const ids = Object.keys(A.G).filter((x) => x.startsWith("nw."));
ok(ids.length >= 15, "Aufgabenarten: " + ids.length);
const num = (s) => Number(String(s).replace(/\s/g, ""));
for (const id of ids) for (const lvl of A.G[id].lvls) for (let seed = 1; seed <= COUNT; seed++) {
  const t = A.make(id, lvl, seed), where = `${id} Stufe ${lvl} Seed ${seed}`;
  ok(t.q && t.hints.length >= 1 && t.solution && t.pts >= 1, "vollständig: " + where);
  if (t.kind === "choice") {
    ok(new Set(t.options).size === t.options.length && t.options.length >= 2, "Antworten verschieden: " + where);
    const right = t.options.indexOf(t.answer);
    ok(right >= 0 && t.check(right).ok, "richtig erkannt: " + where);
    ok(t.options.every((_, i) => i === right || !t.check(i).ok), "genau eine richtige Antwort: " + where);
  } else if (t.kind === "num") {
    ok(t.check(t.answer).ok && !t.check(String(num(t.answer) + 1)).ok && !t.check("").ok, "Zahl: " + where);
  } else {
    ok(t.kind === "text" && t.check(t.answer).ok && !t.check("xyz").ok && !t.check("").ok, "Text: " + where);
  }
  // Wiederholbar: gleicher Seed, gleiche Aufgabe (wichtig für die Fehlerkiste)
  ok(A.make(id, lvl, seed).q === t.q, "reproduzierbar: " + where);

  // ---- unabhängige Nachprüfung je Aufgabenart ----
  if (id === "nw.reihenfolge") {
    let i;
    const m1 = t.q.match(/<b>(\d)\.<\/b>/), m2 = t.q.match(/<b>([A-Za-zä]+)<\/b>/);
    if (m1) i = Number(m1[1]) - 1, ok(t.answer === N.PLANETEN[i] || t.answer === String(i + 1), "Reihenfolge: " + where);
    else ok(t.answer === String(N.PLANETEN.indexOf(m2[1]) + 1), "Nummer des Planeten: " + where);
  }
  if (id === "nw.merksatz") {
    const mp = t.q.match(/<b>(?:„)?([A-Za-zäß]+)(?:“)?<\/b>/)[1];
    if (N.PLANETEN.includes(mp)) ok(t.answer === N.MERKSATZ[N.PLANETEN.indexOf(mp)], "Wort zum Planeten: " + where);
    else ok(t.answer === N.PLANETEN[N.MERKSATZ.indexOf(mp)], "Planet zum Wort: " + where);
  }
  if (id === "nw.steckbrief") {
    const clue = t.q.replace(/^Welcher Planet /, "").replace(/\?.*$/, ""), row = N.STECK.find(([, c]) => c === clue);
    ok(row && t.answer === row[0], "Steckbrief: " + where);
  }
  if (id === "nw.bild") ok(t.answer === N.PLANETEN[Number(t.q.match(/Nummer <b>(\d)<\/b>/)[1]) - 1], "Nummer am Bild: " + where);
  if (id === "nw.iss.rechnen") {
    const a1 = t.q.match(/(\d+) Erdumrundungen/), a2 = t.q.match(/in (\d+) Tagen/), a3 = t.q.match(/in <b>(\d+)<\/b> Stunden/);
    const exp = a1 ? Number(a1[1]) * 90 : a2 ? Number(a2[1]) * 16 : (Number(a3[1]) * 60) / 90;
    ok(Number.isInteger(exp) && num(t.answer) === exp, "ISS-Rechnung: " + where);
  }
  if (id === "nw.groesse") {
    const m = t.q.match(/größer: <b>(\w+)<\/b> oder <b>(\w+)<\/b>/);
    if (m) ok(t.answer === (N.DURCHMESSER[m[1]] > N.DURCHMESSER[m[2]] ? m[1] : m[2]), "größer: " + where);
    else { const k = t.q.match(/der <b>(größte|(\d)\.-größte)<\/b>/); const rang = k[1] === "größte" ? 1 : Number(k[2]); ok(t.answer === N.GROESSE[rang - 1], "Rang: " + where); }
  }
  if (id === "nw.typ") {
    const m = t.q.match(/<b>(\w+)<\/b>/);
    if (m) { const innen = N.PLANETEN.indexOf(m[1]) < 4; ok(t.answer === (/innerer oder/.test(t.q) ? (innen ? "innerer Planet" : "äußerer Planet") : innen ? "fest" : "gasförmig"), "innen/außen: " + where); }
    else ok(num(t.answer) === N.PLANETEN.length, "Anzahl der Planeten: " + where);
  }
  if (id === "nw.gradnetz.zahl") {
    const k = (re) => Number((t.q.match(re) || [])[1]);
    const want = /Längenkreise gibt es insgesamt/.test(t.q) ? 360 : /Äquator<\/b>\?/.test(t.q) || /Nullmeridian/.test(t.q) && /Längengrad/.test(t.q) ? 0
      : /Nordpol<\/b>\? \(Gib/.test(t.q) || /Äquator bis zum Südpol/.test(t.q) ? 90 : /nach <b>Westen/.test(t.q) ? 180 : /einer Stunde/.test(t.q) ? 15
      : /gehst (\d+) Grad nach Norden/.test(t.q) ? k(/gehst (\d+)/) : /bis zum <b>Nordpol/.test(t.q) ? 90 - k(/auf (\d+) Grad/) : /auseinander/.test(t.q) ? 360 - k(/liegen (\d+) Grad/) : NaN;
    ok(num(t.answer) === want, `Gradnetz-Zahlen: ${t.q} -> ${t.answer}, erwartet ${want}`);
  }
}

// ---- Vielfalt: das Thema „Gradnetz: Zahlen“ darf sich nicht in jeder Runde wiederholen ----
for (const l of [1, 2, 3]) { const q = new Set(); for (let i = 1; i <= 80; i++) q.add(A.make("nw.gradnetz.zahl", l, i).q); ok(q.size >= 7, `Gradnetz-Zahlen Stufe ${l}: ${q.size} verschiedene Fragen`); }

// ---- Zeichnungen unabhängig prüfen ----
const RED = "#e0364d";
const reds = (svg, tag) => [...svg.matchAll(new RegExp(`<${tag}[^>]*>`, "g"))].map((m) => m[0]).filter((x) => x.includes(RED) || x.includes("#f3b3bb"));
const attr = (el, a) => Number((el.match(new RegExp(`\\b${a}="([^"]+)"`)) || [])[1]);
for (const [k] of N.GRAD_TEILE) {
  const svg = N.gradnetzSvg(k);
  ok((svg.match(/<svg/g) || []).length === 1 && (svg.match(/<\/svg>/g) || []).length === 1, "Zeichnung vollständig: " + k);
  const marked = reds(svg, "line").length + reds(svg, "ellipse").length + reds(svg, "circle").length + reds(svg, "path").length;
  ok(marked === 1, `genau ein Teil rot: ${k} (${marked})`);
}
{
  const cx = 120, cy = 120, r = 80;
  const e = reds(N.gradnetzSvg("aequator"), "line")[0];
  ok(attr(e, "y1") === cy && attr(e, "y2") === cy && attr(e, "x2") - attr(e, "x1") === 2 * r, "Äquator: waagerecht durch die Mitte, Durchmesser lang");
  const nm = reds(N.gradnetzSvg("nullmeridian"), "line")[0];
  ok(attr(nm, "x1") === cx && attr(nm, "x2") === cx && attr(nm, "y2") - attr(nm, "y1") === 2 * r, "Nullmeridian: senkrecht von Pol zu Pol");
  const ax = reds(N.gradnetzSvg("achse"), "line")[0];
  ok(attr(ax, "x1") === cx && attr(ax, "y2") - attr(ax, "y1") > 2 * r, "Erdachse: senkrecht und länger als der Durchmesser");
  const np = reds(N.gradnetzSvg("nordpol"), "circle")[0], sp = reds(N.gradnetzSvg("suedpol"), "circle")[0];
  ok(attr(np, "cx") === cx && attr(np, "cy") === cy - r && attr(sp, "cy") === cy + r, "Pole oben und unten");
  const lk = reds(N.gradnetzSvg("laenge"), "ellipse")[0];
  ok(Math.abs(attr(lk, "rx") - r * Math.sin(Math.PI / 3)) < 0.01 && attr(lk, "ry") === r, "Längenkreis läuft von Pol zu Pol");
  const bk = reds(N.gradnetzSvg("breite"), "line")[0], hw = (attr(bk, "x2") - attr(bk, "x1")) / 2;
  ok(attr(bk, "y1") === attr(bk, "y2") && attr(bk, "y1") < cy && hw < r && Math.abs(hw - r * Math.cos(Math.PI / 6)) < 0.01, "Breitenkreis parallel zum Äquator, kürzer");
  ok(/ 0 0 1 /.test(reds(N.gradnetzSvg("nordhalb"), "path")[0]) && / 0 0 0 /.test(reds(N.gradnetzSvg("suedhalb"), "path")[0]), "Nord- oben, Südhalbkugel unten");
}
{
  const svg = N.sonnensystemSvg();
  ok((svg.match(/<text/g) || []).length === 8 && [1, 2, 3, 4, 5, 6, 7, 8].every((i) => svg.includes(`>${i}</text>`)), "Bild des Sonnensystems: Nummern 1 bis 8");
  const rad = [...svg.matchAll(/<circle cx="([\d.]+)" cy="45" r="([\d.]+)"/g)].filter((m) => Number(m[1]) > 0).map((m) => Number(m[2]));
  ok(rad.length === 8 && rad[4] === Math.max(...rad) && rad[0] === Math.min(...rad) && rad[4] > rad[5], "Größen im Bild: Jupiter größter, Merkur kleinster");
}

// ---- Probearbeit ----
for (let seed = 1; seed <= 60; seed++) {
  const parts = N.probearbeit(seed);
  ok(parts.length === 5 && parts.every((p) => p.tasks.length >= 4), "fünf Aufgabengruppen");
  const pts = parts.reduce((a, p) => a + p.tasks.reduce((b, t) => b + t.pts, 0), 0);
  ok(pts >= 28 && pts <= 40, "Punktzahl: " + pts);
  ok(JSON.stringify(N.probearbeit(seed).map((p) => p.tasks.map((t) => t.q))) === JSON.stringify(parts.map((p) => p.tasks.map((t) => t.q))), "Probearbeit reproduzierbar");
}
// Note wie in der Schule bleibt gleich
ok(A.note(95).n === 1 && A.note(80).n === 2 && A.note(10).n === 6, "Notenschlüssel");
// Themen sind angemeldet
const tn = A.TOPICS.filter((t) => t.fach === "nw");
ok(tn.length === 4 && tn.every((t) => t.gens.length >= 3 && N.MERKE[t.id]), "vier Themen mit Merkkasten");
ok(A.TOPICS.filter((t) => !t.fach).length === 13, "Mathe-Themen unverändert");

console.log(`Naturwissenschaften ok (${n} Prüfungen)`);
