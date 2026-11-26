// Prüft den Bereich Biologie (Hund und Katze): richtige Antwort wird angenommen, falsche nicht, Inhalte werden unabhängig nachgeprüft,
// die Zeichnungen (Skelett, Gebiss) sind sauber, und die Aufgaben wiederholen sich nicht zu schnell.
// Aufruf: node tools/test-bio.mjs [Anzahl Zufallswerte je Generator und Stufe]
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
const A = req("../public/aufgaben.js");
const B = req("../public/bio.js");
const COUNT = Number(process.argv[2] || 200);
let n = 0;
const ok = (c, m) => { n++; assert.ok(c, m); };

// ---- Daten ----
ok(B.TYPEN.length === 4 && B.TYPEN.every((t) => B.TYP_AUSSAGEN[t].length >= 3), "vier Typen mit je mindestens 3 Aussagen");
const alle = Object.values(B.TYP_AUSSAGEN).flat();
ok(new Set(alle).size === alle.length, "Typ-Aussagen sind einmalig (jede passt zu genau einem Typ)");
ok(B.SKELETT.length === 12 && new Set(B.SKELETT.map((x) => x[0])).size === 12, "zwölf Teile des Skeletts (10 vom Arbeitsblatt, dazu Knie und Oberarm)");
ok(B.SKELETT.slice(0, 10).map((x) => x[1]).join(",") === "Schädel,Wirbelsäule,Schulterblatt,Beckenknochen,Rippen,Oberschenkelknochen,Unterschenkelknochen,Fersenknochen,Mittelfußknochen,Zehenknochen", "Nummern 1 bis 10 wie auf dem Arbeitsblatt");
ok(JSON.stringify(B.ZAHNFORMEL) === '{"Oberkiefer":[6,1,3,3,1,6],"Unterkiefer":[7,1,3,3,1,7]}' && [].concat(B.ZAHNFORMEL.Oberkiefer, B.ZAHNFORMEL.Unterkiefer).reduce((a, b) => a + b, 0) === 42, "Zahnformel wie im Buch, 42 Zähne");
ok(B.RASSEN.some(([r, z]) => r === "Deutscher Schäferhund" && z === "Wachhund") && B.RASSEN.some(([r, z]) => r === "Englische Bulldogge" && z === "Wachhund") && B.RASSEN.some(([r, z]) => r === "Boxer" && z === "Wachhund"), "Rassen wie auf dem Arbeitsblatt (Schäferhund, Bulldogge, Boxer: Wachhund)");
ok(B.HUENDIN.length === 4 && B.WELPE.length === 5, "Welpe: 4 Schritte bei der Hündin, 5 beim Welpen");
ok(B.WELPE[0] === "Unbeholfenes Kriechen" && B.WELPE[4] === "Trinken der Milch" && B.HUENDIN[0].startsWith("Aufreißen"), "Reihenfolge wie auf dem Arbeitsblatt");
ok(B.RASSEN.every(([, z]) => B.ZWECKE.includes(z)) && B.ARBEIT.every(([, z]) => B.ZWECKE.includes(z)), "Verwendungszwecke stammen aus der Liste");
ok(B.RASSEN.some(([r, z]) => r === "Rauhaardackel" && z === "Jagdhund") && B.RASSEN.some(([r, z]) => r === "Sibirian Husky" && z === "Schlittenhund") && B.RASSEN.some(([r, z]) => r === "Bernhardiner" && z === "Such- und Rettungshund"), "Dackel, Husky, Bernhardiner stimmen");
for (const [q, right, wrong] of [].concat(B.SKELETT_FAKTEN, B.GEBISS_FAKTEN, B.WELPE_FAKTEN, B.KATZE_FAKTEN, B.WOLF_FAKTEN, B.KOERPER_FAKTEN, B.BEDARF_FAKTEN, B.GERUCH_FAKTEN)) ok(wrong.length >= 3 && !wrong.includes(right) && new Set([right, ...wrong]).size === wrong.length + 1, "Antworten verschieden: " + q);
ok(B.VERGLEICH.every(([, w]) => ["Hund", "Katze", "beide"].includes(w)), "Vergleich: Hund, Katze oder beide");
ok(B.norm("Reißzahn") === B.norm("Reisszahn") && B.norm("Säugetier") === B.norm("Saeugetier"), "Schreibweisen mit Umlauten werden gleich behandelt");

// ---- Alle Aufgaben: lösbar, Nachbarwerte nicht, Hinweise vorhanden ----
const ids = Object.keys(A.G).filter((x) => x.startsWith("bio."));
ok(ids.length >= 14, "Aufgabenarten: " + ids.length);
for (const id of ids) for (const lvl of A.G[id].lvls) for (let seed = 1; seed <= COUNT; seed++) {
  const t = A.make(id, lvl, seed), where = `${id} Stufe ${lvl} Seed ${seed}`;
  ok(t.q && t.hints.length >= 1 && t.solution && t.pts >= 1, "vollständig: " + where);
  if (t.kind === "choice") {
    ok(new Set(t.options).size === t.options.length && t.options.length >= 2, "Antworten verschieden: " + where);
    const right = t.options.indexOf(t.answer);
    ok(right >= 0 && t.check(right).ok, "richtig erkannt: " + where);
    ok(t.options.every((_, i) => i === right || !t.check(i).ok), "genau eine richtige Antwort: " + where);
  } else if (t.kind === "num") {
    ok(t.check(t.answer).ok && !t.check(String(Number(t.answer) + 1)).ok && !t.check("").ok, "Zahl: " + where);
  } else {
    ok(t.kind === "text" && t.check(t.answer).ok && !t.check("xyz").ok && !t.check("").ok, "Text: " + where);
  }
  ok(A.make(id, lvl, seed).q === t.q, "reproduzierbar: " + where);

  // ---- unabhängige Nachprüfung je Aufgabenart ----
  if (id === "bio.typ") {
    const s = t.q.replace(/^.*<span class="nwsatz">/, "").replace(/<\/span>.*$/, ""), typ = B.TYPEN.find((x) => B.TYP_AUSSAGEN[x].includes(s));
    ok(typ && t.answer === typ, "Typ passt zur Aussage: " + where);
  }
  if (id === "bio.stimmt" || id === "bio.katze.stimmt") {
    const s = t.q.replace(/^.*<span class="nwsatz">/, "").replace(/<\/span>.*$/, ""), row = (id === "bio.stimmt" ? B.STIMMT : B.KATZE_STIMMT).find(([x]) => x === s);
    ok(row && t.answer === (row[1] ? "stimmt" : "stimmt nicht"), "Wahr oder falsch: " + where);
  }
  if (id === "bio.skelett.bild") {
    const k = (t.q.match(/data-teil="(\w+)"[^>]*stroke="#e0364d"/) || [])[1], row = B.SKELETT.find((x) => x[0] === k);
    ok(row && (t.answer === row[1] || row[2].includes(t.answer)), "Skelett: markierter Teil heißt richtig: " + where);
  }
  if (id === "bio.gebiss.bild") {
    const k = (t.q.match(/stroke="#e0364d" stroke-width="2.6" stroke-linejoin="round" data-teil="(\w+)"/) || [])[1], row = B.GEBISS.find((x) => x[0] === k);
    ok(row && (t.answer === row[1] || row[3].includes(t.answer)), "Gebiss: markierte Zähne heißen richtig: " + where);
  }
  if (id === "bio.gebiss.funktion") {
    const row = B.GEBISS.find((g) => t.q.includes(`<b>${g[1]}</b>`) || t.q.includes(g[2]));
    ok(row && (t.answer === row[1] || t.answer === row[2] || row[3].includes(t.answer)), "Zahn und Aufgabe passen: " + where);
  }
  if (id === "bio.rassen") {
    const row = B.RASSEN.find(([r]) => t.q.includes(`<b>${r}</b>`));
    ok(row && t.answer === row[1], "Rasse und Zweck: " + where);
  }
  if (id === "bio.arbeit") {
    const row = B.ARBEIT.find(([a]) => t.q.includes(`>${a}<`));
    ok(row && t.answer === row[1], "Tätigkeit und Hund: " + where);
  }
  if (id === "bio.welpe.reihe") {
    const chain = /Hündin/.test(t.q) ? B.HUENDIN : B.WELPE, nach = /direkt nach/.test(t.q), ref = t.q.match(/„([^“]+)“/)[1], i = chain.indexOf(ref);
    ok(i >= 0 && t.answer === chain[nach ? i + 1 : i - 1], "Reihenfolge: " + where);
  }
  if (id === "bio.gebiss.zahl") {
    const z = B.ZAHNFORMEL, k = /Oberkiefer/.test(t.q) ? "Oberkiefer" : /Unterkiefer/.test(t.q) ? "Unterkiefer" : null, sum = (a) => a.reduce((x, y) => x + y, 0);
    const want = /Oberkiefer und Unterkiefer/.test(t.q) ? sum(z.Oberkiefer) + sum(z.Unterkiefer) : /Reißzähne/.test(t.q) ? 4 : /Zähne hat der Hund im <b>(Ober|Unter)kiefer<\/b> insgesamt/.test(t.q) ? sum(z[k])
      : /Schneidezähne/.test(t.q) ? z[k][2] + z[k][3] : /Eckzähne/.test(t.q) ? z[k][1] + z[k][4] : /Backenzähne/.test(t.q) ? z[k][0] + z[k][5] : NaN;
    ok(Number(t.answer) === want, `Zahnformel: ${t.q} -> ${t.answer}, erwartet ${want}`);
  }
  if (id === "bio.wolf.stimmt") {
    const s = t.q.replace(/^.*<span class="nwsatz">/, "").replace(/<\/span>.*$/, ""), row = B.WOLF_STIMMT.find(([x]) => x === s);
    ok(row && t.answer === (row[1] ? "stimmt" : "stimmt nicht"), "Wolf: wahr oder falsch: " + where);
  }
  if (id === "bio.wolf.fakt") {
    const row = B.WOLF_FAKTEN.find(([q]) => q === t.q);
    ok(row && t.answer === row[1], "Wolf: Frage und Antwort: " + where);
  }
  if (id === "bio.koerper.stimmt" || id === "bio.bedarf.stimmt" || id === "bio.geruch.stimmt") {
    const tab = { "bio.koerper.stimmt": B.KOERPER_STIMMT, "bio.bedarf.stimmt": B.BEDARF_STIMMT, "bio.geruch.stimmt": B.GERUCH_STIMMT }[id];
    const s = t.q.replace(/^.*<span class="nwsatz">/, "").replace(/<\/span>.*$/, ""), row = tab.find(([x]) => x === s);
    ok(row && t.answer === (row[1] ? "stimmt" : "stimmt nicht"), "Wahr oder falsch: " + where);
  }
  if (id === "bio.koerper.fakt" || id === "bio.bedarf.fakt" || id === "bio.geruch.fakt") {
    const tab = { "bio.koerper.fakt": B.KOERPER_FAKTEN, "bio.bedarf.fakt": B.BEDARF_FAKTEN, "bio.geruch.fakt": B.GERUCH_FAKTEN }[id];
    const row = tab.find(([q]) => q === t.q);
    ok(row && t.answer === row[1], "Frage und Antwort: " + where);
  }
  if (id === "bio.geruch.zahl") {
    const row = B.GERUCH_ZAHLEN.find(([q]) => q === t.q);
    ok(row && Number(t.answer) === row[1], "Geruchssinn-Zahl: " + where);
  }
  if (id === "bio.koerper.bild") {
    const m1 = t.q.match(/Auf welchem Bild zeigt der Wolf <b>(\w+)<\/b>/), m2 = t.q.match(/auf <b>Bild ([ABC])<\/b>/) || t.q.match(/Bild ([ABC])<\/b>\?/);
    if (m1) { const L = Object.keys(B.POSEN).find((k) => B.POSEN[k] === m1[1]); ok(t.answer === "Bild " + L, "Bild zum Verhalten: " + where); }
    else ok(m2 && B.POSEN[m2[1]] === t.answer, "Verhalten zum Bild: " + where);
  }
  if (id === "bio.vergleich") {
    const s = t.q.replace(/^.*<span class="nwsatz">/, "").replace(/<\/span>.*$/, ""), row = B.VERGLEICH.find(([x]) => x === s);
    ok(row && t.answer === row[1], "Hund, Katze oder beide: " + where);
  }
}

// ---- Vielfalt: eine Runde von 8 Aufgaben soll nicht dieselbe Frage zweimal enthalten ----
for (const id of ids) {
  const q = new Set(); for (let i = 1; i <= 120; i++) q.add(A.make(id, 2, i).q);
  const min = { "bio.gebiss.bild": 3, "bio.skelett.bild": 6, "bio.koerper.bild": 3 }[id] || 8;
  ok(q.size >= min, `genug verschiedene Fragen: ${id} ${q.size}`);
}
for (const t of A.TOPICS.filter((x) => x.fach === "bio")) {
  const q = new Set(); for (const id of t.gens) for (const l of [1, 2, 3]) for (let i = 1; i <= 40; i++) q.add(A.make(id, l, i).q);
  ok(q.size >= 20, `Thema ${t.name}: ${q.size} verschiedene Fragen`);
}

// ---- Zeichnungen unabhängig prüfen ----
const RED = "#e0364d";
const redGroups = (svg) => [...svg.matchAll(/<g data-teil="(\w+)"[^>]*stroke="#e0364d"/g)].map((m) => m[1]);
for (const [k] of B.SKELETT) {
  const svg = B.skelettSvg(k);
  ok((svg.match(/<svg/g) || []).length === 1 && (svg.match(/<\/svg>/g) || []).length === 1, "Skelett vollständig: " + k);
  ok(JSON.stringify(redGroups(svg)) === JSON.stringify([k]), `genau ein Teil rot: ${k} (${redGroups(svg)})`);
  ok(B.SKELETT.every(([j]) => svg.includes(`data-teil="${j}"`)), "alle zwölf Teile gezeichnet: " + k);
  ok(!/NaN|undefined/.test(svg), "keine ungültigen Zahlen: " + k);
}
ok(redGroups(B.skelettSvg()).length === 0, "ohne Markierung nichts rot");
{
  // Lage der Teile: Schädel vorne rechts, Becken links, Zehen unten, Wirbelsäule oben
  const svg = B.skelettSvg();
  const pts = (k) => { const m = svg.match(new RegExp(`<g data-teil="${k}"[^>]*>(.*?)</g>`)); return [...m[1].matchAll(/[ML] ?(-?[\d.]+) (-?[\d.]+)/g)].map((x) => [Number(x[1]), Number(x[2])]); };
  const cx = (k) => pts(k).reduce((a, p) => a + p[0], 0) / pts(k).length, cy = (k) => pts(k).reduce((a, p) => a + p[1], 0) / pts(k).length;
  ok(cx("schaedel") > cx("rippen") && cx("rippen") > cx("becken"), "Schädel vorn, Rippen in der Mitte, Becken hinten");
  ok(cy("oberschenkel") < cy("unterschenkel") && cy("unterschenkel") < cy("mittelfuss") && cy("mittelfuss") < cy("zehen"), "Hinterbein von oben nach unten: Ober-, Unterschenkel, Mittelfuß, Zehen");
  ok(cy("oberschenkel") < cy("knie") && cy("knie") < cy("unterschenkel") + 10, "Knie liegt zwischen Oberschenkel und Unterschenkel");
  ok(cx("oberarm") > cx("rippen") && cy("oberarm") < cy("zehen"), "Oberarm liegt am Vorderbein oben");
  ok(cy("zehen") > cy("rippen") && cy("rippen") > Math.min(...pts("schulter").map((p) => p[1])) - 1, "Zehen unten, Rippen darüber");
}
for (const [k] of B.GEBISS) {
  const svg = B.gebissSvg(k);
  ok((svg.match(/<svg/g) || []).length === 1 && (svg.match(/<\/svg>/g) || []).length === 1, "Gebiss vollständig: " + k);
  const red = [...svg.matchAll(/stroke="#e0364d"[^>]*data-teil="(\w+)"/g)].map((m) => m[1]);
  ok(red.length >= 2 && red.every((x) => x === k), `nur Zähne der Art ${k} rot (${red.length} Zähne)`);
  ok(!/NaN|undefined/.test(svg), "keine ungültigen Zahlen: " + k);
}
{
  const eck = [...B.gebissSvg().matchAll(/d="M(\d+) (\d+) L(\d+) (\d+) L(\d+) (\d+) Z"[^>]*data-teil="eck"/g)];
  ok(eck.length === 2, "ein Eckzahn oben, einer unten");
  const hoehe = (m) => Math.abs(Number(m[4]) - Number(m[2]));
  const schneide = [...B.gebissSvg().matchAll(/d="M(\d+) (\d+) L(\d+) (\d+) L(\d+) (\d+) Z"[^>]*data-teil="schneide"/g)];
  ok(eck.every((e) => schneide.every((s) => hoehe(e) > hoehe(s))), "Eckzähne sind länger als die Schneidezähne");
  const reiss = B.gebissSvg().match(/data-teil="reiss"/g).length;
  ok(reiss === 2, "ein Reißzahn im Ober- und einer im Unterkiefer");
}

// ---- Wolf-Körpersprache: A aufrecht mit erhobener Rute, B steif mit waagerechter Rute und Zähnen, C geduckt mit eingezogener Rute ----
{
  const svg = B.wolfSvg();
  ok((svg.match(/<svg/g) || []).length === 1 && (svg.match(/<\/svg>/g) || []).length === 1 && !/NaN|undefined|\+/.test(svg.replace(/<text[^>]*>.*?<\/text>/g, "")), "Wolf-Bild vollständig und ohne ungültige Zahlen");
  const g = (L) => svg.match(new RegExp(`<g data-pose="${L}".*?</g>`))[0];
  const tail = (L) => { const d = g(L).match(/class="tail" d="M([\d.]+) ([\d.]+) Q([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/); return { y: Number(d[6]), x: Number(d[5]), x0: Number(d[1]), y0: Number(d[2]) }; };
  const body = (L) => Number((g(L).match(/<path d="M[\d.]+ ([\d.]+) Q/) || [])[1]);
  ok(tail("A").y < tail("A").y0 - 20, "A: Rute steht nach oben");
  ok(Math.abs(tail("B").y - tail("B").y0) <= 8 && tail("B").x - tail("B").x0 > 20, "B: Rute waagerecht");
  ok(tail("C").y > tail("C").y0 + 15, "C: Rute nach unten eingezogen");
  ok(body("A") < body("B") && body("B") < body("C"), "Der Körper wird von A über B nach C tiefer");
  ok(/fill="#fff"/.test(g("B")) && !/fill="#fff"/.test(g("A")) && !/fill="#fff"/.test(g("C")), "Nur B zeigt die Zähne");
  ok(["A", "B", "C"].every((L) => (B.wolfSvg(L).match(/stroke="#e0364d"/g) || []).length >= 5 && !new RegExp(`<g data-pose="[^${L}]"[^>]*stroke="#e0364d"`).test(B.wolfSvg(L))), "genau ein Wolf ist rot markiert");
}

// ---- Probearbeit ----
for (let seed = 1; seed <= 60; seed++) {
  const parts = B.probearbeit(seed);
  ok(parts.length === 7 && parts.every((p) => p.tasks.length >= 4), "sieben Aufgabengruppen");
  const pts = parts.reduce((a, p) => a + p.tasks.reduce((b, t) => b + t.pts, 0), 0);
  ok(pts >= 30 && pts <= 52, "Punktzahl: " + pts);
  ok(JSON.stringify(B.probearbeit(seed).map((p) => p.tasks.map((t) => t.q))) === JSON.stringify(parts.map((p) => p.tasks.map((t) => t.q))), "Probearbeit reproduzierbar");
}
// Themen sind angemeldet
const tb = A.TOPICS.filter((t) => t.fach === "bio");
ok(tb.length === 10 && tb.every((t) => t.gens.length >= 2 && t.name && t.icon && B.MERKE[t.id]) && tb.filter((t) => !t.lern).map((t) => t.id).join() === "katze", "zehn Themen mit Aufgaben und Merkkasten, nur die Katze steht nicht auf dem Lernzettel");
ok(tb.every((t) => t.gens.every((g) => A.G[g])), "Themen verweisen auf vorhandene Aufgabenarten");
ok(A.TOPICS.filter((t) => !t.fach).length >= 13, "Mathe-Themen bleiben unverändert");
console.log(`Biologie ok (${n} Prüfungen)`);
