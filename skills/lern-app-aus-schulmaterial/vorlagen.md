# Vorlagen für `lern-app-aus-schulmaterial`

Kurze Muster. Sie sind Beispiele, keine Pflicht. Ein fertiges Beispiel mit 55 Generatoren ist die Mathe-App „Capy & Mathe“ (Repo `Schule-emma`, falls vorhanden): `public/aufgaben.js`, `tools/test-aufgaben.mjs`, `tools/e2e.mjs`.

## Zufall und Aufgabe
```js
function seeded(s) { s = s >>> 0; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = (seed) => { const f = seeded(seed); return { int: (a, b) => a + Math.floor(f() * (b - a + 1)), pick: (a) => a[Math.floor(f() * a.length)], chance: (p) => f() < p }; };

// Ein Generator: (r, stufe) -> Aufgabe
gen("runden.auf", "runden", "Runden", (r, lvl) => {
  const p = r.pick([10, 100, 1000]), n = r.int(100, 99999);
  return numTask({ q: `Runde auf ${p}: <b>${n}</b>`, ans: Math.round(n / p) * p,
    hints: ["Schau auf die Ziffer rechts von der Rundungsstelle.", "0–4 abrunden, 5–9 aufrunden."],
    solution: `${n} ≈ <b>${Math.round(n / p) * p}</b>` });
});

// Aus Generator, Stufe und Startwert entsteht dieselbe Aufgabe wieder (Fehlerkiste)
const make = (genId, lvl, seed) => { const t = G[genId].f(R(seed), lvl); return Object.assign(t, { gen: genId, lvl, seed }); };
```

Eine Aufgabe hat: `q`, `kind`, `check(eingabe) -> {ok, note?, cells?}`, `answer` (Text), `hints[]` (mindestens eine), `solution` (HTML), `pts`.

## Prüfung mit Rechtschreib-Modus
```js
const norm = (s) => String(s).toLowerCase().replace(/ß/g, "ss").replace(/ä|ae/g, "a").replace(/ö|oe/g, "o").replace(/ü|ue/g, "u").replace(/[^a-z0-9]/g, "");
// Lautschlüssel für "erkennbar": gleich klingende Schreibweisen werden gleich
const sound = (s) => norm(s).replace(/ph/g, "f").replace(/th/g, "t").replace(/ck/g, "k").replace(/tz/g, "z").replace(/z/g, "ts").replace(/v/g, "f").replace(/([aeiou])h/g, "$1").replace(/ie/g, "i").replace(/(.)\1+/g, "$1").replace(/d$/, "t").replace(/g$/, "k").replace(/b$/, "p");
const tol = (len) => (len < 4 ? 0 : len < 6 ? 1 : len < 10 ? 2 : 3);

function judge(eingabe, namen, andere = [], modus = "erkennbar") {
  const n = norm(eingabe);
  if (!n) return { ok: false, kind: "empty" };
  if (namen.some((x) => norm(x) === n)) return { ok: true, kind: "exact" };
  if (modus !== "erkennbar") return { ok: false, kind: "wrong" };
  const sn = sound(eingabe);
  if (namen.some((x) => sound(x) === sn) && !andere.some((o) => sound(o) === sn)) return { ok: true, kind: "typo" };
  // Abstand zum nächsten richtigen Namen; ein anderer Begriff darf nicht näher oder gleich nah sein
  const d = (x) => Math.min(lev(norm(x), n), lev(sound(x), sn) + 1);
  const best = Math.min(...namen.map(d));
  const ok = best <= tol(norm(namen[0]).length) && !andere.some((o) => d(o) <= best);
  return { ok, kind: ok ? "typo" : "wrong" };
}
```
Test dazu: für jede Kategorie alle Paare (A, B) prüfen, dass `judge(A, [B])` falsch ist.

## Probearbeit
- Aufbau wie der Test im Buch oder das Material der Lehrkraft, in Aufgaben mit Teilaufgaben a), b), c).
- Punkte pro Teilaufgabe. Schriftliches Rechnen: Punkte für Überschlag, Rechnung, Probe.
- Zeit in `localStorage` als Startzeitpunkt speichern (nicht als Zähler), damit sie bei Neuladen weiterläuft.
- Antworten bei jeder Eingabe speichern.
- Note: `note(prozent, schluessel)` mit Standard `[92, 80, 65, 50, 25]`, Tendenz + oder − in den oberen und unteren 25 % der Stufe. Immer als Schätzung beschriften.
- Test-Haken `window.__TEST = { examMs: 1500 }`, damit der Browser-Test das Zeitende in Sekunden erreicht.

## Test-Gerüst (Node)
```js
for (const g of Object.values(G)) for (const lvl of g.lvls) for (let i = 0; i < 300; i++) {
  const t = make(g.id, lvl, (i * 7919 + lvl * 104729) >>> 0);
  assert.ok(!/undefined|NaN/.test(t.q + t.solution));
  assert.ok(t.check(richtigeEingabe(t)).ok);
  assert.ok(!t.check(falscheEingabe(t)).ok);
}
```

## Browser-Test (Playwright)
- Server mit `http.createServer` auf einem freien Port, `serviceWorkers: "block"` (außer im Offline-Test).
- Hilfsfunktion `solveIn(selector)`, die je nach `kind` die richtige Antwort in die Felder schreibt.
- Danach `check` klicken und auf `.fb.ok` warten.
- Für Screenshots `deviceScaleFactor: 2` und die Bilder ansehen.

## Offline (`sw.js`)
```js
const CACHE = "app-v1"; // bei jeder sichtbaren Änderung hochzählen
// Mit Netz immer neu laden (höchstens 4 s warten), ohne Netz aus dem Cache.
```
