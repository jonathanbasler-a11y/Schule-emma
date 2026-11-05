// Aufgaben-Generatoren für die Mathe-Klassenarbeit Klasse 5 (natürliche Zahlen).
// Reine Logik ohne Oberfläche: läuft im Browser und in Node (tools/test-aufgaben.mjs).
// Jede Aufgabe ist aus (Generator, Stufe, Zufallszahl) reproduzierbar, damit die Fehlerkiste sie wiederfindet.
(function (root) {
  "use strict";

  // ---------- Zufall ----------
  function seeded(s) {
    s = s >>> 0;
    return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function R(seed) {
    const f = seeded(seed);
    const r = {
      f,
      int: (a, b) => a + Math.floor(f() * (b - a + 1)),
      pick: (arr) => arr[Math.floor(f() * arr.length)],
      chance: (p) => f() < p,
      shuffle: (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
      digits: (n) => { let s = String(r.int(1, 9)); for (let i = 1; i < n; i++) s += r.int(0, 9); return Number(s); },
    };
    return r;
  }

  // ---------- Zahlen schreiben und lesen ----------
  const NB = " "; // schmales Leerzeichen zwischen Dreiergruppen, wie im Buch
  function fmt(n) {
    const s = String(n);
    if (s.length <= 4) return s; // 4-stellig ohne Lücke, wie im Buch (1250, 7105)
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, NB);
  }
  // "12 547", "12.547", "12547" -> 12547; sonst NaN
  function parseNum(s) {
    const t = String(s == null ? "" : s).replace(/[\s  .'’]/g, "");
    if (!/^\d+$/.test(t)) return NaN;
    return Number(t);
  }

  // Zahlwörter (Schreibregel aus dem Buch: unter einer Million klein und zusammen, ab Million getrennt)
  const E = ["", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
  const Z = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
  function u100(n) { return n < 20 ? E[n] : (n % 10 ? E[n % 10] + "und" : "") + Z[Math.floor(n / 10)]; }
  function u1000(n, last) {
    const h = Math.floor(n / 100), r = n % 100;
    let s = (h ? E[h] + "hundert" : "") + (r ? u100(r) : "");
    if (last && r === 1) s += "s"; // eins, hunderteins
    return s;
  }
  function zahlwort(n) {
    if (n === 0) return "null";
    const parts = [];
    const big = [[1e12, "Billion", "Billionen"], [1e9, "Milliarde", "Milliarden"], [1e6, "Million", "Millionen"]];
    for (const [v, one, many] of big) {
      const c = Math.floor(n / v) % 1000;
      if (c) parts.push(c === 1 ? "eine " + one : u1000(c, false) + " " + many);
    }
    const r = n % 1e6, t = Math.floor(r / 1000), e = r % 1000;
    const low = (t ? u1000(t, false) + "tausend" : "") + (e ? u1000(e, true) : "");
    if (low) parts.push(low);
    return parts.join(" ");
  }
  const nz = (s) => String(s).toLowerCase().replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/[^a-z]/g, "");
  const DICT = (() => {
    const d = { "": 0, ein: 1, eins: 1, eine: 1 };
    for (let i = 1; i < 1000; i++) {
      d[nz(u1000(i, true))] = i;
      d[nz(u1000(i, false))] = i;
      if (i >= 100 && i < 200) { d[nz(u1000(i, true)).slice(3)] = i; d[nz(u1000(i, false)).slice(3)] = i; } // "hundertzwei" statt "einhundertzwei"
    }
    return d;
  })();
  function wortZuZahl(input) {
    if (/\d/.test(String(input))) return NaN;
    let s = nz(input);
    if (!s) return NaN;
    if (s === "null") return 0;
    let total = 0;
    for (const [name, v, pl] of [["billion", 1e12, "en"], ["milliarde", 1e9, "n"], ["million", 1e6, "en"]]) {
      const i = s.indexOf(name);
      if (i < 0) continue;
      const left = s.slice(0, i);
      let after = s.slice(i + name.length);
      const c = left === "" ? 1 : DICT[left];
      if (c !== 1 && after.startsWith(pl)) after = after.slice(pl.length);
      if (c == null || c === 0) return NaN;
      total += c * v;
      s = after;
    }
    const ti = s.indexOf("tausend");
    if (ti >= 0) {
      const l = s.slice(0, ti), rr = s.slice(ti + 7);
      const c = l === "" ? 1 : DICT[l];
      if (c == null || c === 0 || DICT[rr] == null) return NaN;
      return total + c * 1000 + DICT[rr];
    }
    if (DICT[s] == null) return NaN;
    return total + DICT[s];
  }

  // Römische Zahlzeichen
  const ROM = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  function toRoman(n) { let s = ""; for (const [v, c] of ROM) while (n >= v) { s += c; n -= v; } return s; }
  function fromRoman(s) {
    s = String(s).toUpperCase().replace(/\s/g, "");
    if (!/^[MDCLXVI]+$/.test(s)) return NaN;
    const V = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let t = 0;
    for (let i = 0; i < s.length; i++) { const a = V[s[i]], b = V[s[i + 1]] || 0; t += a < b ? -a : a; }
    return t;
  }
  const romanValid = (s) => { const n = fromRoman(s); return n > 0 && n < 4000 && toRoman(n) === String(s).toUpperCase(); };

  // Zweiersystem
  const toBin = (n) => n.toString(2);
  function parseBin(s) {
    const u = String(s).replace(/\s/g, "").replace(/^\(([01]+)\)(₂|_2|2)?$/, "$1").replace(/₂$/, "");
    return /^[01]+$/.test(u) ? parseInt(u, 2) : NaN;
  }
  const bin = (n) => `(${toBin(n)})<sub>2</sub>`;

  const roundTo = (n, p) => Math.round(n / p) * p;
  const STELLEN = [[10, "Zehner"], [100, "Hunderter"], [1000, "Tausender"], [1e4, "Zehntausender"], [1e5, "Hunderttausender"], [1e6, "Millionen"]];
  const stelleName = (p) => STELLEN.find((x) => x[0] === p)[1];
  const PLACE = ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender", "Hunderttausender", "Millionen", "Zehnmillionen", "Hundertmillionen", "Milliarden"];

  // ---------- Prüfen ----------
  const numCheck = (ans) => (inp) => ({ ok: parseNum(inp) === ans });
  // Überschlag: glatte Zahlen (höchstens 3 gültige Ziffern) und nah genug am genauen Ergebnis.
  // Das Buch sagt: man muss sich dabei nicht an die Rundungsregeln halten.
  function ueValue(s) {
    const t0 = String(s || "").replace(/[\s\u202F]/g, "").replace(/·|\*|x/gi, "*").replace(/:/g, "/").replace(/−|–/g, "-").replace(/\.(?=\d{3}(\D|$))/g, "");
    if (!t0) return null;
    const [lhs, rhs] = t0.split("=");
    const ev = (t) => {
      if (/^\d+$/.test(t)) return { v: Number(t), terms: [Number(t)] };
      if (!/^\d+([+\-*/]\d+)+$/.test(t)) return null;
      let v; try { v = Function(`"use strict";return (${t})`)(); } catch (e) { return null; }
      return Number.isFinite(v) ? { v, terms: t.split(/[+\-*/]/).map(Number) } : null;
    };
    const L = ev(lhs);
    if (rhs !== undefined) { const Rr = ev(rhs); if (!Rr) return null; return { v: Rr.v, terms: L ? L.terms : Rr.terms }; }
    return L;
  }
  const sig = (n) => String(Math.round(Math.abs(n))).replace(/0+$/, "").length;
  function ueOk(s, exact) {
    const u = ueValue(s);
    if (!u) return false;
    if (u.v === exact && sig(exact) > 3) return false; // genau ausgerechnet ist kein Überschlag
    const glatt = u.terms.every((x) => sig(x) <= 3 || x < 100);
    return glatt && Math.abs(u.v - exact) <= Math.max(0.25 * exact, 10);
  }
  function ueBeispiel(op, nums) {
    const r = (x) => { const p = Math.pow(10, Math.max(0, String(x).length - 1)); return x < 10 ? x : roundTo(x, p); };
    const rs = nums.map(r);
    const sym = { "+": " + ", "-": " − ", "*": " · ", "/": " : " }[op];
    let v = rs[0];
    for (let i = 1; i < rs.length; i++) v = op === "+" ? v + rs[i] : op === "-" ? v - rs[i] : op === "*" ? v * rs[i] : Math.round(v / rs[i]);
    return `${rs.map(fmt).join(sym)} = ${fmt(v)}`;
  }

  // ---------- Bilder (SVG als Text) ----------
  // Zahlenstrahl: min, Schritt pro Strich, Anzahl Striche, jeder wievielte beschriftet, Pfeile
  function svgLine(o) {
    const W = 660, pad = 26, n = o.n, dx = (W - 2 * pad - 20) / n;
    const x = (v) => pad + ((v - o.min) / o.step) * dx;
    let s = `<svg class="nline" viewBox="0 0 ${W} 96" role="img" aria-label="Zahlenstrahl">`;
    s += `<line x1="${pad - 8}" y1="60" x2="${W - 8}" y2="60" class="axis"/><path d="M${W - 16} 54 L${W - 6} 60 L${W - 16} 66" class="axis" fill="none"/>`;
    for (let i = 0; i <= n; i++) {
      const v = o.min + i * o.step, X = x(v), big = i % o.labelEvery === 0;
      s += `<line x1="${X}" y1="${big ? 51 : 55}" x2="${X}" y2="${big ? 69 : 65}" class="${big ? "tick big" : "tick"}"/>`;
      if (big && !o.noLabels) s += `<text x="${X}" y="88" class="lbl">${fmt(v)}</text>`;
      if (o.place) s += `<rect class="hit" data-v="${v}" x="${X - dx / 2}" y="36" width="${dx}" height="40"/>`;
    }
    (o.marks || []).forEach((m) => {
      const X = x(m.v);
      s += `<g class="mark"><text x="${X}" y="16" class="mlbl">${m.label}</text><path d="M${X} 22 L${X} 46 M${X - 5} 40 L${X} 47 L${X + 5} 40" fill="none"/></g>`;
    });
    return s + "</svg>";
  }
  // Säulen- oder Balkendiagramm
  function svgBars(o) {
    const horiz = !!o.horiz, W = 560, H = 300, L = horiz ? 110 : 50, B = horiz ? 30 : 46, T = 20;
    const max = o.max, u = o.unit, nGrid = max / u;
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagramm">`;
    const pw = W - L - 20, ph = H - T - B;
    for (let i = 0; i <= nGrid; i++) {
      const v = i * u;
      if (horiz) {
        const X = L + (v / max) * pw;
        s += `<line x1="${X}" y1="${T}" x2="${X}" y2="${H - B}" class="grid"/>`;
        if (i % (o.labelEvery || 1) === 0) s += `<text x="${X}" y="${H - B + 18}" class="lbl">${fmt(v)}</text>`;
      } else {
        const Y = H - B - (v / max) * ph;
        s += `<line x1="${L}" y1="${Y}" x2="${W - 10}" y2="${Y}" class="grid"/>`;
        if (i % (o.labelEvery || 1) === 0) s += `<text x="${L - 8}" y="${Y + 4}" class="lbl" text-anchor="end">${fmt(v)}</text>`;
      }
    }
    const k = o.cats.length, slot = (horiz ? ph : pw) / k, bw = slot * 0.56;
    o.cats.forEach((c, i) => {
      const cls = `sbar c${i % 6}`;
      if (horiz) {
        const Y = T + i * slot + (slot - bw) / 2, w = (c.v / max) * pw;
        s += `<rect class="${cls}" x="${L}" y="${Y}" width="${w}" height="${bw}" rx="3"/><text x="${L - 8}" y="${Y + bw / 2 + 5}" class="cat" text-anchor="end">${c.name}</text>`;
      } else {
        const X = L + i * slot + (slot - bw) / 2, h = (c.v / max) * ph;
        s += `<rect class="${cls}" x="${X}" y="${H - B - h}" width="${bw}" height="${h}" rx="3"/><text x="${X + bw / 2}" y="${H - B + 20}" class="cat">${c.name}</text>`;
      }
    });
    s += horiz ? `<line x1="${L}" y1="${T - 6}" x2="${L}" y2="${H - B}" class="axis"/><line x1="${L}" y1="${H - B}" x2="${W - 8}" y2="${H - B}" class="axis"/>`
      : `<line x1="${L}" y1="${T - 6}" x2="${L}" y2="${H - B}" class="axis"/><line x1="${L}" y1="${H - B}" x2="${W - 8}" y2="${H - B}" class="axis"/>`;
    if (o.yTitle) s += `<text x="${horiz ? W - 10 : L + 6}" y="${horiz ? H - 4 : 12}" class="atitle" text-anchor="${horiz ? "end" : "start"}">${o.yTitle}</text>`;
    return s + "</svg>";
  }
  const tally = (n) => { let s = '<span class="tally">'; for (let i = 0; i < Math.floor(n / 5); i++) s += '<span class="t5">||||</span>'; if (n % 5) s += `<span class="t1">${"|".repeat(n % 5)}</span>`; return s + "</span>"; };

  // Schriftliche Rechnung als Lösungsbild (Kästchenpapier)
  function gridSolution(op, nums, extra) {
    const res = op === "+" ? nums.reduce((a, b) => a + b, 0) : op === "-" ? nums[0] - nums[1] : null;
    const w = Math.max(...nums.map((n) => String(n).length), String(res).length) + 1;
    const row = (txt, cls, sign) => `<div class="grow ${cls || ""}">${(sign || "").padStart(1)}${String(txt).padStart(w - 1, " ").split("").map((c) => `<i>${c === " " ? "" : c}</i>`).join("")}</div>`;
    let h = `<div class="gsol">`;
    nums.forEach((n, i) => { h += row(n, "", i ? `<i>${op === "+" ? "+" : "−"}</i>` : "<i></i>"); });
    if (extra && extra.carry) h += row(extra.carry, "carry", "<i></i>");
    h += `<div class="gline"></div>` + row(res, "res", "<i></i>") + "</div>";
    return h;
  }
  function carries(op, nums) {
    // Überträge von rechts, wie im Buch
    const L = Math.max(...nums.map((n) => String(n).length)) + 1;
    const ds = nums.map((n) => String(n).padStart(L, "0").split("").map(Number));
    let c = 0, out = new Array(L).fill(" ");
    for (let i = L - 1; i >= 0; i--) {
      let v;
      if (op === "+") v = ds.reduce((a, d) => a + d[i], 0) + c;
      else { v = ds[0][i] - ds.slice(1).reduce((a, d) => a + d[i], 0) - c; }
      const nc = op === "+" ? Math.floor(v / 10) : (v < 0 ? Math.ceil(-v / 10) : 0);
      if (i > 0 && nc) out[i - 1] = String(nc);
      c = nc;
    }
    return out.join("").replace(/^\s+$/, "");
  }
  function addSteps(op, nums) {
    const L = Math.max(...nums.map((n) => String(n).length));
    const ds = nums.map((n) => String(n).padStart(L + 1, "0").split("").map(Number));
    const names = ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender", "Hunderttausender", "Millionen", "Zehnmillionen"];
    const st = []; let c = 0;
    for (let k = 0; k < L; k++) {
      const i = L - k;
      if (op === "+") {
        const parts = ds.map((d) => d[i]); const v = parts.reduce((a, b) => a + b, 0) + c;
        st.push(`${names[k]}: ${c ? c + " + " : ""}${parts.join(" + ")} = ${v} → schreibe <b>${v % 10}</b>${v >= 10 ? `, übertrage ${Math.floor(v / 10)}` : ""}`);
        c = Math.floor(v / 10);
      } else {
        const top = ds[0][i], sub = ds.slice(1).reduce((a, d) => a + d[i], 0) + c;
        let r = top - sub, nc = 0; while (r < 0) { r += 10; nc++; }
        st.push(`${names[k]}: ${sub} plus wie viel gleich ${top + nc * 10}? → <b>${r}</b>${nc ? `, übertrage ${nc}` : ""}`);
        c = nc;
      }
    }
    if (op === "+" && c) st.push(`Übertrag ${c} ganz vorne hinschreiben.`);
    return st;
  }
  function mulRows(a, b) {
    // Zeilen wie im Buch: erste Ziffer des 2. Faktors zuerst, jede Zeile eine Stelle weiter rechts
    const bs = String(b).split("").map(Number);
    return bs.map((d, i) => ({ d, v: a * d, shift: bs.length - 1 - i }));
  }
  function divSteps(a, b) {
    const s = String(a), st = []; let cur = 0, q = "", started = false;
    for (let i = 0; i < s.length; i++) {
      cur = cur * 10 + Number(s[i]);
      if (!started && cur < b && i < s.length - 1) continue;
      started = true;
      const d = Math.floor(cur / b);
      st.push(`${b} passt ${d}-mal in ${cur}: schreibe <b>${d}</b>. ${cur} − ${d * b} = ${cur - d * b}${i < s.length - 1 ? `, hole ${s[i + 1]} herunter` : ""}.`);
      q += d; cur -= d * b;
    }
    return { st, q: Number(q || 0), r: cur };
  }

  // ---------- Bausteine für Aufgaben ----------
  const T = (o) => Object.assign({ kind: "num", pts: 1, hints: [], unit: "" }, o);
  const numTask = (o) => T(Object.assign({ check: numCheck(o.ans), answer: fmt(o.ans) }, o));
  const choiceTask = (o) => T(Object.assign({ kind: "choice", check: (i) => ({ ok: Number(i) === o.correct }), answer: o.options[o.correct] }, o));
  const opSym = { "+": "+", "-": "−", "*": "·", "/": ":" };

  // ---------- Generatoren ----------
  const G = {};
  const gen = (id, topic, name, f, o) => { G[id] = Object.assign({ id, topic, name, f, lvls: [1, 2, 3] }, o || {}); };

  // ===== Zahlenstrahl & Ordnen =====
  const LINES = [
    // [min-Möglichkeiten, Schritt, Striche, Beschriftung alle]
    { lvl: 1, step: 1, n: 50, lab: 10, mins: [0] },
    { lvl: 1, step: 2, n: 40, lab: 5, mins: [0] },
    { lvl: 2, step: 5, n: 40, lab: 4, mins: [0, 100, 200] },
    { lvl: 2, step: 10, n: 40, lab: 10, mins: [500, 800, 1200] },
    { lvl: 3, step: 4, n: 50, lab: 5, mins: [1200, 1500] },
    { lvl: 3, step: 50, n: 40, lab: 4, mins: [1000, 3000] },
    { lvl: 3, step: 25, n: 40, lab: 4, mins: [0, 2000] },
  ];
  gen("strahl.lesen", "strahl", "Zahlen am Zahlenstrahl ablesen", (r, lvl) => {
    const L = r.pick(LINES.filter((l) => l.lvl === lvl)), min = r.pick(L.mins);
    const i = r.int(1, L.n - 1);
    const v = min + i * L.step;
    return numTask({
      q: `Welche Zahl ist mit dem Pfeil markiert?${svgLine({ min, step: L.step, n: L.n, labelEvery: L.lab, marks: [{ v, label: "A" }] })}`,
      ans: v,
      hints: [`Wie groß ist der Abstand von einem Strich zum nächsten? Zwischen ${fmt(min)} und ${fmt(min + L.lab * L.step)} liegen ${L.lab} Abstände.`, `Ein Strich bedeutet hier ${L.step}. Zähle vom nächsten beschrifteten Strich aus weiter.`],
      solution: `Ein Strich = ${L.step}. Der Pfeil steht ${i % L.lab} Striche nach ${fmt(min + Math.floor(i / L.lab) * L.lab * L.step)}: ${fmt(min + Math.floor(i / L.lab) * L.lab * L.step)} + ${i % L.lab} · ${L.step} = <b>${fmt(v)}</b>.`,
    });
  });
  gen("strahl.setzen", "strahl", "Zahlen am Zahlenstrahl eintragen", (r, lvl) => {
    const L = r.pick(LINES.filter((l) => l.lvl === lvl)), min = r.pick(L.mins);
    const i = r.int(1, L.n - 1), v = min + i * L.step;
    return T({
      kind: "place", line: { min, step: L.step, n: L.n, labelEvery: L.lab },
      q: `Tippe auf dem Zahlenstrahl die Stelle an, an der <b>${fmt(v)}</b> liegt.`,
      check: (x) => ({ ok: Number(x) === v }), answer: fmt(v), target: v,
      hints: [`Ein Strich bedeutet hier ${L.step}.`, `Suche zuerst den beschrifteten Strich direkt vor ${fmt(v)}.`],
      solution: `${fmt(v)} liegt ${i % L.lab} Striche rechts von ${fmt(min + Math.floor(i / L.lab) * L.lab * L.step)}.`,
    });
  });
  gen("ordnen.vergleich", "strahl", "Größer, kleiner oder gleich?", (r, lvl) => {
    const len = lvl === 1 ? r.int(2, 4) : lvl === 2 ? r.int(4, 6) : r.int(6, 9);
    const a = r.digits(len);
    let b;
    const mode = r.int(0, 4);
    if (mode === 0) b = a;
    else if (mode === 1) { const s = String(a).split(""); const i = r.int(0, s.length - 1), j = r.int(0, s.length - 1); [s[i], s[j]] = [s[j], s[i]]; if (s[0] === "0") [s[0], s[i]] = [s[i], s[0]]; b = Number(s.join("")); }
    else if (mode === 2) b = a + r.pick([-2, -1, 1, 2, 10, -10]);
    else if (mode === 3 && lvl > 1) b = Number(String(a).slice(0, -1)); // weniger Stellen
    else b = r.digits(len);
    if (b < 0) b = a + 1;
    const c = a < b ? 0 : a > b ? 1 : 2;
    return choiceTask({
      kind: "cmp", q: `Setze das richtige Zeichen ein: <span class="cmpq"><b>${fmt(a)}</b> <span class="kbx">?</span> <b>${fmt(b)}</b></span>`,
      options: ["<", ">", "="], correct: c,
      hints: ["Zähle zuerst die Stellen. Mehr Stellen = größere Zahl.", "Gleich viele Stellen? Dann von links Ziffer für Ziffer vergleichen."],
      solution: `${fmt(a)} ${["<", ">", "="][c]} ${fmt(b)}${c === 2 ? "" : ` – ${String(a).length !== String(b).length ? "die Stellenzahl entscheidet." : "die erste unterschiedliche Ziffer von links entscheidet."}`}`,
    });
  });
  gen("ordnen.reihe", "strahl", "Zahlen der Größe nach ordnen", (r, lvl) => {
    let nums;
    if (lvl === 1) { nums = new Set(); while (nums.size < 6) nums.add(r.int(2, 400)); nums = [...nums]; }
    else { const len = lvl === 2 ? 3 : 4; const ds = [r.int(1, 9), r.int(0, 9), r.int(1, 9), r.int(0, 9)].slice(0, len); const set = new Set(); let guard = 0; while (set.size < 6 && guard++ < 200) { const p = r.shuffle(ds); if (p[0] !== 0) set.add(Number(p.join(""))); if (guard > 60) set.add(Number(r.digits(len))); } nums = [...set]; }
    const sorted = nums.slice().sort((a, b) => a - b);
    return T({
      kind: "order", items: r.shuffle(nums), q: "Tippe die Zahlen der Größe nach an. Beginne mit der kleinsten.",
      check: (arr) => ({ ok: arr.length === sorted.length && arr.every((v, i) => Number(v) === sorted[i]) }),
      answer: sorted.map(fmt).join(" < "),
      hints: ["Suche zuerst die kleinste Zahl. Gleich viele Stellen? Dann entscheidet die erste Ziffer von links."],
      solution: sorted.map(fmt).join(" &lt; "),
    });
  });
  gen("ordnen.nachbar", "strahl", "Vorgänger und Nachfolger", (r, lvl) => {
    const vor = r.chance(0.5);
    let n, label;
    if (lvl === 1) n = r.pick([r.int(10, 999), r.int(1, 9) * 100, r.int(1, 9) * 1000 - 1]);
    else if (lvl === 2) n = r.pick([r.int(1, 99) * 1000, r.int(1, 99) * 1000 - 1, r.digits(5)]);
    else n = r.pick([r.int(2, 99) * 1e6, r.int(2, 30) * 1e9, r.int(10, 999) * 1000]);
    label = lvl === 3 && r.chance(0.6) ? zahlwort(n) : fmt(n);
    const ans = vor ? n - 1 : n + 1;
    return numTask({
      q: `Gib den <b>${vor ? "Vorgänger" : "Nachfolger"}</b> in Ziffern an: <span class="big">${label}</span>`,
      ans, hints: [vor ? "Der Vorgänger ist um 1 kleiner." : "Der Nachfolger ist um 1 größer.", "Achtung bei Nullen und Neunen: dort ändert sich mehr als nur die letzte Ziffer."],
      solution: `${fmt(n)} ${vor ? "− 1" : "+ 1"} = <b>${fmt(ans)}</b>`,
    });
  });
  gen("ordnen.zwischen", "strahl", "Wie viele Zahlen passen dazwischen?", (r, lvl) => {
    const a = lvl === 1 ? r.int(2, 40) : lvl === 2 ? r.int(50, 500) : r.pick([10, 100, 1000, 10000]);
    const b = lvl === 3 ? a * r.pick([10, 100]) : a + r.int(5, lvl === 1 ? 50 : 500);
    const worded = r.chance(0.3);
    return numTask({
      q: worded ? `Wie viele natürliche Zahlen liegen <b>zwischen</b> ${fmt(a)} und ${fmt(b)}?` : `Wie viele natürliche Zahlen kann man für das Kästchen einsetzen? <span class="big">${fmt(a)} &lt; <span class="kbx">?</span> &lt; ${fmt(b)}</span>`,
      ans: b - a - 1,
      hints: ["Die beiden Grenzen selbst zählen nicht mit.", `Von ${fmt(a + 1)} bis ${fmt(b - 1)} – wie viele Zahlen sind das? Tipp: letzte − erste + 1.`],
      solution: `Erlaubt sind ${fmt(a + 1)} bis ${fmt(b - 1)}: ${fmt(b - 1)} − ${fmt(a + 1)} + 1 = <b>${fmt(b - a - 1)}</b>`,
    });
  });
  gen("ordnen.raetsel", "strahl", "Zahlenrätsel", (r) => {
    const n = r.int(100, 9000);
    const k = r.int(0, 3);
    const v = [
      [`Ihr Vorgänger ist der Nachfolger von ${fmt(n)}.`, n + 2, `Nachfolger von ${fmt(n)} ist ${fmt(n + 1)}. Die gesuchte Zahl hat ${fmt(n + 1)} als Vorgänger, also ${fmt(n + 2)}.`],
      [`Ihr Nachfolger ist der Vorgänger von ${fmt(n)}.`, n - 2, `Vorgänger von ${fmt(n)} ist ${fmt(n - 1)}. Die gesuchte Zahl hat ${fmt(n - 1)} als Nachfolger, also ${fmt(n - 2)}.`],
      [`Sie ist der Nachfolger des Nachfolgers von ${fmt(n)}.`, n + 2, `${fmt(n)} → ${fmt(n + 1)} → ${fmt(n + 2)}`],
      [`Ihr Vorgänger hat keinen Vorgänger.`, 1, "Nur die 0 hat keinen Vorgänger. Die Zahl mit dem Vorgänger 0 ist 1."],
    ][k];
    return numTask({ q: `Welche Zahl ist das? ${v[0]}`, ans: v[1], hints: ["Schreibe dir die Zahlen nacheinander auf: Vorgänger = 1 weniger, Nachfolger = 1 mehr."], solution: v[2] }, { lvls: [2, 3] });
  }, { lvls: [2, 3] });
  gen("strahl.haus", "strahl", "Hausnummern-Rätsel", (r, lvl) => {
    const odd = r.chance(0.5), k = r.int(6, lvl === 1 ? 15 : 40);
    const nr = odd ? 2 * k - 1 : 2 * k;
    const rev = lvl > 1 && r.chance(0.5);
    return numTask({
      q: rev ? `In einer Straße haben die Häuser auf einer Seite nur ${odd ? "ungerade" : "gerade"} Hausnummern (${odd ? "1, 3, 5, …" : "2, 4, 6, …"}). Das wievielte Haus hat die Nummer ${nr}?`
        : `In einer Straße haben die Häuser auf einer Seite nur ${odd ? "ungerade" : "gerade"} Hausnummern (${odd ? "1, 3, 5, …" : "2, 4, 6, …"}). Welche Nummer hat das ${k}. Haus?`,
      ans: rev ? k : nr, hints: [odd ? "Das 1. Haus hat 1, das 2. Haus 3, das 3. Haus 5 … Die Nummer ist immer 2 · Platz − 1." : "Das 1. Haus hat 2, das 2. Haus 4 … Die Nummer ist immer 2 · Platz."],
      solution: odd ? `Nummer = 2 · ${k} − 1 = ${nr}` : `Nummer = 2 · ${k} = ${nr}`,
    });
  });

  // ===== Stellentafel & Zahlwörter =====
  function bigNumber(r, lvl) {
    if (lvl === 1) return r.pick([r.int(1000, 99999), r.int(10, 99) * 1000 + r.int(0, 20), r.int(100, 999) * 100]);
    if (lvl === 2) return r.pick([r.int(100000, 999999), r.int(1, 99) * 1e6 + r.int(0, 999) * 1000 + r.int(0, 999), r.int(1, 999) * 1e6 + r.int(0, 99)]);
    return r.pick([r.int(1, 99) * 1e9 + r.int(0, 999) * 1e6 + r.int(0, 999) * 1000 + r.int(0, 999), r.int(1, 999) * 1e9 + r.int(0, 50), r.int(1, 9) * 1e12 + r.int(0, 9) * 1e9 + r.int(0, 99)]);
  }
  gen("stellen.wort", "stellen", "Zahlwort → Ziffern", (r, lvl) => {
    const n = bigNumber(r, lvl);
    return numTask({
      q: `Schreibe die Zahl in Ziffern:<span class="wort">${zahlwort(n)}</span>`, ans: n,
      hints: ["Zerlege das Zahlwort in Dreierpäckchen: Milliarden | Millionen | Tausender | Rest.", "Jedes Päckchen hat genau 3 Stellen. Fehlt etwas, schreibst du Nullen."],
      solution: `<b>${fmt(n)}</b>${stellenTafel(n)}`,
    });
  });
  gen("stellen.zahl", "stellen", "Ziffern → Zahlwort", (r, lvl) => {
    const n = bigNumber(r, Math.min(lvl, 2));
    const w = zahlwort(n);
    return T({
      kind: "text", q: `Schreibe die Zahl in Worten: <span class="big">${fmt(n)}</span>`, answer: w,
      check: (inp) => {
        const v = wortZuZahl(inp);
        if (v !== n) return { ok: false };
        const t = String(inp).trim();
        const regel = n < 1e6 ? !/\s/.test(t) && t === t.toLowerCase() : true;
        return { ok: true, note: regel ? "" : "Zahl stimmt! Merke: Unter einer Million schreibt man alles klein und zusammen." };
      },
      hints: ["Lies die Zahl in Dreierpäckchen von links.", "Unter einer Million: klein und zusammen. Million und Milliarde schreibt man groß und getrennt."],
      solution: `<b>${w}</b>`,
    });
  });
  function stellenTafel(n, hi) {
    const s = String(n), names = ["E", "Z", "H", "T", "ZT", "HT", "Mio", "ZMio", "HMio", "Mrd", "ZMrd", "HMrd", "Bio"];
    const k = s.length;
    let h = '<table class="stafel"><tr>';
    for (let i = k - 1; i >= 0; i--) h += `<th>${names[i]}</th>`;
    h += "</tr><tr>";
    for (let i = 0; i < k; i++) h += `<td class="${hi === i ? "hi" : ""}">${s[i]}</td>`;
    return h + "</tr></table>";
  }
  gen("stellen.wert", "stellen", "Stellenwert einer Ziffer", (r, lvl) => {
    const len = lvl === 1 ? r.int(3, 5) : lvl === 2 ? r.int(5, 7) : r.int(7, 9);
    let s = String(r.digits(len)).split("");
    const d = r.int(1, 9), pos = r.int(0, len - 1);
    s = s.map((c, i) => (i === pos ? String(d) : c === String(d) ? String((d % 9) + 1 === d ? 0 : (d % 9) + 1) : c));
    if (s[0] === "0") s[0] = String(d === 1 ? 2 : 1);
    const n = Number(s.join("")), place = len - 1 - pos, ans = d * Math.pow(10, place);
    return numTask({
      q: `Welchen Stellenwert hat die Ziffer <b>${d}</b> in <span class="big">${fmt(n)}</span>? Gib den Wert als Zahl an.`, ans,
      hints: ["Trage die Zahl in eine Stellentafel ein.", `Die ${d} steht an der ${PLACE[place]}-Stelle.`],
      solution: `Die ${d} steht bei den ${PLACE[place]}n: Wert <b>${fmt(ans)}</b>${stellenTafel(n, pos)}`,
    });
  });
  gen("stellen.tafel", "stellen", "Zahlen in die Stellentafel", (r, lvl) => {
    const n = bigNumber(r, Math.min(lvl, 2)), s = String(n), names = ["E", "Z", "H", "T", "ZT", "HT", "Mio", "ZMio", "HMio", "Mrd"];
    const cells = s.split("").map((c, i) => ({ label: names[s.length - 1 - i], ans: c }));
    const fromWord = r.chance(0.5);
    return T({
      kind: "cells", cells, q: `Trage die Zahl in die Stellentafel ein: <span class="${fromWord ? "wort" : "big"}">${fromWord ? zahlwort(n) : fmt(n)}</span>`,
      check: (inp) => { const c = cells.map((x, i) => String(inp[i] || "").trim() === x.ans); return { ok: c.every(Boolean), cells: c }; },
      answer: fmt(n), hints: ["Ganz rechts stehen die Einer. Fülle von rechts nach links.", "Leere Stellen in der Mitte bekommen eine 0."], solution: stellenTafel(n),
    });
  });
  gen("stellen.kaertchen", "stellen", "Zahlenkärtchen legen", (r, lvl) => {
    const cards = r.shuffle(lvl === 1 ? [r.int(1, 9), r.int(1, 9), r.int(1, 9), r.int(0, 9)] : [r.int(1, 9), r.int(1, 9), r.int(10, 99), r.int(10, 99), r.int(100, 999)]);
    const big = r.chance(0.5);
    const sorted = cards.slice().sort((a, b) => (big ? Number(String(b) + a) - Number(String(a) + b) : Number(String(a) + b) - Number(String(b) + a)));
    let ans = sorted.join("");
    if (!big && ans[0] === "0") { const i = sorted.findIndex((c) => c !== 0); const c = sorted.splice(i, 1)[0]; sorted.unshift(c); ans = sorted.join(""); }
    return numTask({
      q: `Lege alle Kärtchen nebeneinander, sodass eine möglichst <b>${big ? "große" : "kleine"}</b> Zahl entsteht. ${cards.map((c) => `<span class="karte">${c}</span>`).join(" ")}`,
      ans: Number(ans),
      hints: [big ? "Vorne sollen die größten Ziffern stehen." : "Vorne sollen die kleinsten Ziffern stehen (aber keine 0 ganz vorne).", "Bei mehrstelligen Kärtchen: probiere beide Reihenfolgen, z. B. 4|41 oder 41|4, und vergleiche."],
      solution: `${sorted.map((c) => `<span class="karte">${c}</span>`).join(" ")} → <b>${fmt(Number(ans))}</b>`,
    });
  }, { lvls: [2, 3] });

  // ===== Runden =====
  function roundPlace(r, lvl) {
    const ps = lvl === 1 ? [10, 100, 1000] : lvl === 2 ? [100, 1000, 1e4] : [1e4, 1e5, 1e6];
    return r.pick(ps);
  }
  function roundNum(r, p, lvl) {
    const len = Math.max(String(p).length + 1, lvl === 1 ? r.int(3, 5) : lvl === 2 ? r.int(5, 6) : r.int(6, 8));
    let n = r.digits(len);
    const m = r.int(0, 4);
    if (m === 0) { const base = Math.floor(n / (10 * p)) * 10 * p; n = base + 9 * p + r.int(Math.ceil(p / 2), p - 1); } // 39 960 -> 40 000
    if (m === 1) n = Math.floor(n / p) * p + p / 2 + (p >= 10 ? r.int(0, Math.max(0, p / 10 - 1)) : 0); // genau 5 danach
    if (m === 2) n = Math.floor(n / p) * p + Math.floor(p / 2) - 1; // knapp abrunden (4 9 9 ...)
    return Math.max(n, p);
  }
  gen("runden.auf", "runden", "Runden", (r, lvl) => {
    const p = roundPlace(r, lvl), n = roundNum(r, p, lvl), ans = roundTo(n, p);
    const s = String(n), idx = s.length - String(p).length; // Stelle rechts von der Rundungsstelle
    const dRight = Number(s[idx + 1] || 0);
    return numTask({
      q: `Runde auf <b>${stelleName(p)}</b>: <span class="big">${fmt(n)}</span>`, ans,
      hints: [`Markiere die ${stelleName(p)}-Stelle. Schau auf die Ziffer rechts daneben.`, "0, 1, 2, 3, 4 → abrunden. 5, 6, 7, 8, 9 → aufrunden. Alles rechts davon wird 0."],
      solution: `Rechts von der Rundungsstelle steht eine <b>${dRight}</b> → ${dRight >= 5 ? "aufrunden" : "abrunden"}: ${fmt(n)} ≈ <b>${fmt(ans)}</b>`,
    });
  });
  gen("runden.pruefen", "runden", "Wurde richtig gerundet?", (r, lvl) => {
    const p = roundPlace(r, lvl), n = roundNum(r, p, lvl), right = roundTo(n, p);
    const wrong = r.pick([right, right + p, right - p, Math.floor(n / p) * p, Math.floor(n / (p / 10)) * (p / 10)].filter((x) => x > 0));
    const ok = wrong === right;
    return choiceTask({
      q: `Auf ${stelleName(p)} gerundet: <span class="big">${fmt(n)} ≈ ${fmt(wrong)}</span> Ist das richtig?`,
      options: ["Ja, richtig", `Nein, richtig wäre ${fmt(right === wrong ? right + p : right)}`, `Nein, richtig wäre ${fmt(right === wrong ? right - p : (right === wrong + p ? wrong - p : wrong + p))}`],
      correct: ok ? 0 : 1, solution: `${fmt(n)} ≈ <b>${fmt(right)}</b> (auf ${stelleName(p)})`,
      hints: ["Runde selbst und vergleiche.", "Achte darauf, dass die Rundungsstelle stimmt – nicht auf die falsche Stelle runden!"],
    });
  });
  gen("runden.grenzen", "runden", "Kleinste und größte Zahl", (r, lvl) => {
    const p = r.pick(lvl === 1 ? [10, 100] : lvl === 2 ? [100, 1000] : [1000, 1e4, 1e6]);
    const v = r.int(2, lvl === 1 ? 99 : 999) * p;
    const lo = v - p / 2, hi = v + p / 2 - 1;
    const story = lvl > 1 && r.chance(0.4);
    return T({
      kind: "cells", cells: [{ label: story ? "mindestens" : "kleinste Zahl", ans: String(lo) }, { label: story ? "höchstens" : "größte Zahl", ans: String(hi) }],
      q: story ? `Lina hat Bonbons gezählt. Sie verrät nur das auf ${stelleName(p)} gerundete Ergebnis: <b>${fmt(v)}</b>. Wie viele sind es mindestens, wie viele höchstens?`
        : `Gib die kleinste und die größte Zahl an, die auf <b>${stelleName(p)}</b> gerundet <b>${fmt(v)}</b> ergibt.`,
      check: (inp) => { const c = [parseNum(inp[0]) === lo, parseNum(inp[1]) === hi]; return { ok: c[0] && c[1], cells: c }; },
      answer: `${fmt(lo)} bis ${fmt(hi)}`,
      hints: [`Die kleinste Zahl wird gerade noch aufgerundet: rechts von der Rundungsstelle eine 5.`, `Die größte wird gerade noch abgerundet: rechts eine 4, danach lauter 9en.`],
      solution: `kleinste: <b>${fmt(lo)}</b> (wird aufgerundet), größte: <b>${fmt(hi)}</b> (wird abgerundet)`,
    });
  });
  gen("runden.anzahl", "runden", "Wie viele Zahlen ergeben gerundet …?", (r, lvl) => {
    const p = r.pick(lvl === 1 ? [10] : lvl === 2 ? [10, 100] : [100, 1000, 1e6]);
    const v = r.int(2, 99) * p;
    return numTask({ q: `Wie viele natürliche Zahlen ergeben auf ${stelleName(p)} gerundet <b>${fmt(v)}</b>?`, ans: p, hints: [`Bestimme die kleinste (${fmt(v - p / 2)}?) und die größte Zahl und zähle.`], solution: `Von ${fmt(v - p / 2)} bis ${fmt(v + p / 2 - 1)}: das sind <b>${fmt(p)}</b> Zahlen.` });
  });
  const SINNVOLL = [["Telefonnummer", false], ["Postleitzahl", false], ["Notruf 112", false], ["Hausnummer", false], ["PIN deiner Bankkarte", false], ["Trikotnummer", false], ["Zuschauer im Stadion", true], ["Schritte an einem Tag", true], ["Einwohner einer Stadt", true], ["Entfernung zur Sonne", true], ["Temperatur in der Sahara", true], ["Smartphone-Nutzer in Deutschland", true], ["Kontonummer", false], ["Zahlencode am Fahrradschloss", false]];
  gen("runden.sinnvoll", "runden", "Ist Runden sinnvoll?", (r) => {
    const [w, ok] = r.pick(SINNVOLL);
    return choiceTask({ q: `Ist Runden hier sinnvoll? <span class="big">${w}</span>`, options: ["Ja", "Nein"], correct: ok ? 0 : 1, hints: ["Frage dich: Ist es schlimm, wenn die Zahl nicht ganz genau stimmt?"], solution: ok ? "Ja – hier reicht ein ungefährer Wert." : "Nein – hier muss die Zahl ganz genau stimmen, sonst funktioniert sie nicht." });
  }, { lvls: [1, 2] });
  gen("runden.doppelt", "runden", "Vorsicht beim doppelten Runden", (r) => {
    const h = r.int(1, 9) * 100 + r.int(1, 8) * 10 + r.pick([0, 1, 2]);
    const n = h + 40 + r.int(5, 9) - 40; // x45..x49
    const m = Math.floor(n / 100) * 100 + 40 + r.int(5, 9);
    const direct = roundTo(m, 100), twice = roundTo(roundTo(m, 10), 100);
    return choiceTask({
      q: `Emilia soll ${m} auf Hunderter runden. Sie rundet zuerst auf Zehner (${roundTo(m, 10)}) und dann auf Hunderter (${twice}). Franka rundet direkt: ${direct}. Wer hat recht?`,
      options: [`Franka (${direct})`, `Emilia (${twice})`, "Beide"], correct: 0,
      hints: ["Beim Runden schaut man nur auf die Ziffer direkt rechts neben der Rundungsstelle – in der ursprünglichen Zahl."],
      solution: `Bei ${m} steht rechts von den Hundertern eine 4 → abrunden: <b>${direct}</b>. Zweimal runden verfälscht das Ergebnis.`,
    });
  }, { lvls: [3] });
  gen("runden.tabelle", "runden", "Eine Zahl auf verschiedene Stellen runden", (r, lvl) => {
    const n = lvl === 3 ? r.int(1000000, 99999999) : r.int(10000, 999999);
    const ps = lvl === 3 ? [1e6, 1000, 100, 10] : [1000, 100, 10];
    const cells = ps.map((p) => ({ label: stelleName(p), ans: String(roundTo(n, p)) }));
    return T({ kind: "cells", cells, q: `Runde <span class="big">${fmt(n)}</span> auf …`, check: (inp) => { const c = cells.map((x, i) => parseNum(inp[i]) === Number(x.ans)); return { ok: c.every(Boolean), cells: c }; }, answer: cells.map((c) => `${c.label}: ${fmt(Number(c.ans))}`).join(", "), hints: ["Jedes Mal von der ursprünglichen Zahl aus runden, nicht vom vorigen Ergebnis!"], solution: cells.map((c) => `${c.label}: <b>${fmt(Number(c.ans))}</b>`).join("<br>") });
  }, { lvls: [2, 3] });

  // ===== Schriftlich rechnen =====
  function writtenTask(op, nums, lvl, o) {
    let res, rest = 0;
    if (op === "+") res = nums.reduce((a, b) => a + b, 0);
    if (op === "-") res = nums[0] - nums[1];
    if (op === "*") res = nums[0] * nums[1];
    if (op === "/") { res = Math.floor(nums[0] / nums[1]); rest = nums[0] % nums[1]; }
    const sym = opSym[op];
    let solution, steps;
    if (op === "+" || op === "-") { steps = addSteps(op, nums); solution = gridSolution(op, nums, { carry: carries(op, nums) }); }
    if (op === "*") {
      const rows = mulRows(nums[0], nums[1]);
      steps = rows.map((x) => `${fmt(nums[0])} · ${x.d} = ${fmt(x.v)}${x.shift ? ` (eine Stelle ${x.shift > 1 ? x.shift + " Stellen " : ""}weiter links enden lassen)` : ""}`.replace("eine Stelle 2 Stellen", "2 Stellen").replace("eine Stelle 3 Stellen", "3 Stellen")).concat([`Teilergebnisse stellengerecht addieren: <b>${fmt(res)}</b>`]);
      solution = mulSolution(nums[0], nums[1]);
    }
    if (op === "/") { const d = divSteps(nums[0], nums[1]); steps = d.st; solution = `<div class="dsol">${fmt(nums[0])} : ${nums[1]} = <b>${fmt(res)}</b>${rest ? ` Rest <b>${rest}</b>` : ""}</div><ol class="steps">${d.st.map((x) => `<li>${x}</li>`).join("")}</ol><div class="probe">Probe: ${fmt(res)} · ${nums[1]}${rest ? ` + ${rest}` : ""} = ${fmt(nums[0])} ✓</div>`; }
    const exact = op === "/" ? nums[0] / nums[1] : res;
    return T(Object.assign({
      kind: "written", op, nums, res, rest, pts: 3, ue: true,
      q: `Berechne schriftlich. Mache vorher einen Überschlag.<span class="big">${nums.map(fmt).join(` ${sym} `)}</span>`,
      check: (inp) => {
        const ok = parseNum(inp.res) === res && (op !== "/" || (parseNum(inp.rest || "0") || 0) === rest);
        const ue = inp.ue ? ueOk(inp.ue, exact) : null;
        return { ok, ue, note: ue === false ? `Dein Überschlag passt nicht ganz. Zum Beispiel: ${ueBeispiel(op, nums)}` : "" };
      },
      answer: `${fmt(res)}${rest ? " Rest " + rest : ""}`,
      hints: [`Überschlag zum Beispiel: ${ueBeispiel(op, nums)}`, steps[0] + (steps[1] ? "<br>" + steps[1] : "")],
      steps, solution: `Überschlag: ${ueBeispiel(op, nums)}<br>${solution}${op !== "/" ? `<ol class="steps">${steps.map((x) => `<li>${x}</li>`).join("")}</ol>` : ""}`,
    }, o || {}));
  }
  function mulSolution(a, b) {
    const rows = mulRows(a, b), res = a * b;
    const head = `${a}·${b}`;
    const W = Math.max(head.length, String(res).length + 1);
    // Zeile i endet unter der i-ten Ziffer des zweiten Faktors
    const end0 = String(a).length + 1; // Spalte der ersten Ziffer von b (0-basiert)
    const line = (txt, endCol, cls, sign) => `<div class="grow ${cls || ""}"><i>${sign || ""}</i>${Array.from({ length: W }, (_, c) => { const off = c - (endCol - txt.length + 1); return `<i>${off >= 0 && off < txt.length ? txt[off] : ""}</i>`; }).join("")}</div>`;
    let h = `<div class="gsol">` + line(head, head.length - 1, "head");
    rows.forEach((x, i) => { h += line(String(x.v), end0 + i, "", i ? "+" : ""); });
    h += `<div class="gline"></div>` + line(String(res), head.length - 1, "res") + "</div>";
    return h;
  }
  gen("schrift.add", "addsub", "Schriftlich addieren", (r, lvl) => {
    const k = lvl === 3 ? r.int(3, 4) : lvl === 2 ? r.int(2, 3) : 2;
    const nums = Array.from({ length: k }, () => r.digits(lvl === 1 ? r.int(3, 4) : lvl === 2 ? r.int(4, 5) : r.int(3, 6)));
    return writtenTask("+", nums, lvl);
  });
  gen("schrift.sub", "addsub", "Schriftlich subtrahieren", (r, lvl) => {
    let a = r.digits(lvl === 1 ? r.int(3, 4) : lvl === 2 ? r.int(4, 5) : r.int(5, 7)), b = r.digits(Math.max(2, String(a).length - r.int(0, 2)));
    if (lvl === 3 && r.chance(0.4)) a = Math.pow(10, String(a).length - 1) + r.int(0, 9) * (r.chance(0.5) ? 1 : 0) + (r.chance(0.5) ? 1 : 0); // 1 000 001 − …
    if (b >= a) [a, b] = [b + r.int(1, 999), a];
    if (b >= a) a = b + r.int(100, 999);
    return writtenTask("-", [a, b], lvl);
  });
  gen("schrift.mul", "mal", "Schriftlich multiplizieren", (r, lvl) => {
    const a = r.digits(lvl === 1 ? 3 : lvl === 2 ? r.int(3, 4) : r.int(3, 4)), b = lvl === 1 ? r.int(2, 9) * (r.chance(0.5) ? 1 : 0) || r.int(12, 49) : lvl === 2 ? r.int(12, 99) : r.pick([r.int(101, 999), r.int(1, 9) * 100 + r.int(1, 9), r.int(10, 99) * 10]);
    return writtenTask("*", [a, b], lvl);
  });
  gen("schrift.div", "div", "Schriftlich dividieren", (r, lvl) => {
    const b = lvl === 1 ? r.int(3, 9) : lvl === 2 ? r.int(11, 25) : r.int(13, 57);
    let q = lvl === 1 ? r.int(21, 999) : r.int(101, 999);
    if (lvl >= 2 && r.chance(0.35)) q = Number(String(q).slice(0, 1) + "0" + String(q).slice(2)); // 0 im Ergebnis (309)
    if (lvl === 3 && r.chance(0.25)) q = Number(String(q).slice(0, 2) + "0"); // 0 am Ende (150)
    const rest = lvl === 1 ? (r.chance(0.3) ? r.int(1, b - 1) : 0) : r.chance(0.45) ? r.int(1, b - 1) : 0;
    return writtenTask("/", [q * b + rest, b], lvl, { q: `Berechne schriftlich${rest || lvl > 1 ? " (vielleicht mit Rest)" : ""}. Mache vorher einen Überschlag.<span class="big">${fmt(q * b + rest)} : ${b}</span>` });
  });
  gen("schrift.luecke", "addsub", "Fehlende Ziffern ergänzen", (r, lvl) => {
    const len = lvl === 1 ? 3 : 4;
    const a = r.digits(len), b = r.digits(len - (r.chance(0.5) ? 0 : 1));
    const sum = a + b;
    const L = String(sum).length;
    const rows = [String(a).padStart(L, " "), String(b).padStart(L, " "), String(sum)];
    // pro Spalte höchstens ein Loch, nur dort, wo beide Summanden Ziffern haben
    const cells = [], holes = rows.map(() => new Set());
    const nH = lvl === 1 ? 2 : 3;
    const cols = r.shuffle([...Array(L).keys()].filter((c) => rows[0][c] !== " " && rows[1][c] !== " ")).slice(0, nH);
    cols.sort((x, y) => x - y).forEach((c) => { const ri = r.int(0, 2); holes[ri].add(c); });
    const grid = rows.map((s, ri) => s.split("").map((ch, c) => (holes[ri].has(c) ? { hole: cells.push({ label: "", ans: ch }) - 1 } : { ch })));
    return T({
      kind: "holes", grid, op: "+", cells, q: "Ergänze die fehlenden Ziffern.",
      check: (inp) => { const c = cells.map((x, i) => String(inp[i] || "").trim() === x.ans); return { ok: c.every(Boolean), cells: c }; },
      answer: `${fmt(a)} + ${fmt(b)} = ${fmt(sum)}`, hints: ["Fang ganz rechts bei den Einern an und denk an die Überträge.", "Fehlt eine Ziffer oben? Rechne: Ergebnisziffer minus untere Ziffer (minus Übertrag)."],
      solution: gridSolution("+", [a, b], { carry: carries("+", [a, b]) }),
    });
  }, { lvls: [2, 3] });
  gen("schrift.fehler", "addsub", "Fehler finden", (r, lvl) => {
    const op = r.pick(lvl === 1 ? ["+", "-"] : ["+", "-", "*"]);
    let a, b, right, wrong, why;
    if (op === "+") {
      do { a = r.digits(4); b = r.digits(4); } while (!carries("+", [a, b]).trim());
      right = a + b;
      // Übertrag vergessen
      const L = String(right).length; let c = 0, s = "";
      const da = String(a).padStart(L, "0"), db = String(b).padStart(L, "0");
      for (let i = L - 1; i >= 0; i--) s = ((Number(da[i]) + Number(db[i])) % 10) + s;
      wrong = Number(s); why = "Der Übertrag wurde vergessen.";
      if (wrong === right) wrong = right + 10;
    } else if (op === "-") {
      do { a = r.digits(3); b = r.digits(3); if (b > a) [a, b] = [b, a]; } while (a === b || !String(a).split("").some((d, i) => Number(d) < Number(String(b).padStart(3, "0")[i])));
      right = a - b;
      const da = String(a), db = String(b).padStart(3, "0");
      wrong = Number(da.split("").map((d, i) => Math.abs(Number(d) - Number(db[i]))).join("")); why = "Es wurde immer die kleinere von der größeren Ziffer abgezogen – statt mit Übertrag zu rechnen.";
      if (wrong === right) wrong = right + 100;
    } else {
      a = r.int(101, 499); b = r.int(12, 49); right = a * b;
      wrong = a * Math.floor(b / 10) + a * (b % 10); why = "Die zweite Zeile wurde nicht um eine Stelle eingerückt (aus " + Math.floor(b / 10) + " Zehnern wurden " + Math.floor(b / 10) + " Einer).";
    }
    return numTask({
      q: `Diese Rechnung ist falsch: <span class="big">${fmt(a)} ${opSym[op]} ${fmt(b)} = ${fmt(wrong)}</span> Berechne das richtige Ergebnis.`, ans: right,
      hints: ["Mach zuerst einen Überschlag – dann siehst du, ob das Ergebnis überhaupt passen kann.", "Rechne selbst schriftlich nach."],
      solution: `${why}<br>Richtig: ${fmt(a)} ${opSym[op]} ${fmt(b)} = <b>${fmt(right)}</b>`,
    });
  });
  gen("schrift.ueberschlag", "addsub", "Überschlag: welches Ergebnis stimmt?", (r, lvl) => {
    const op = r.pick(["+", "-", "*"]);
    const a = r.digits(lvl === 1 ? 4 : 5), b = op === "*" ? r.digits(lvl === 1 ? 2 : 3) : r.digits(lvl === 1 ? 4 : 5);
    const [x, y] = op === "-" && b > a ? [b, a] : [a, b];
    const res = op === "+" ? x + y : op === "-" ? x - y : x * y;
    const opts = r.shuffle([res, res + r.pick([1, -1]) * Math.pow(10, String(res).length - 2) * r.int(2, 5), Math.round(res / 10) + r.int(1, 9), res * 10 + r.int(1, 9)]);
    return choiceTask({ q: `Entscheide mit einem Überschlag, welches Ergebnis stimmt: <span class="big">${fmt(x)} ${opSym[op]} ${fmt(y)}</span>`, options: opts.map(fmt), correct: opts.indexOf(res), hints: [`Überschlag: ${ueBeispiel(op, [x, y])}`], solution: `Überschlag ${ueBeispiel(op, [x, y])} → <b>${fmt(res)}</b>` });
  });

  // ===== Kopfrechnen =====
  gen("kopf.addsub", "addsub", "Kopfrechnen plus und minus", (r, lvl) => {
    const op = r.pick(["+", "-"]);
    let a, b;
    if (lvl === 1) { a = r.int(20, 400); b = r.int(10, 300); }
    else if (lvl === 2) { a = r.int(100, 9999); b = r.pick([r.int(10, 999), r.int(1, 99) * 100]); }
    else { a = r.int(10, 999) * 1000; b = r.int(10, 999) * 1000; }
    if (op === "-" && b > a) [a, b] = [b, a];
    const ans = op === "+" ? a + b : a - b;
    return numTask({ q: `Rechne im Kopf: <span class="big">${fmt(a)} ${opSym[op]} ${fmt(b)}</span>`, ans, hints: ["Zerlege: erst die großen Stellen, dann den Rest.", op === "+" ? `${fmt(a)} + ${fmt(b - (b % 100))} = ${fmt(a + b - (b % 100))}, dann + ${b % 100}` : `${fmt(a)} − ${fmt(b - (b % 100))} = ${fmt(a - b + (b % 100))}, dann − ${b % 100}`], solution: `${fmt(a)} ${opSym[op]} ${fmt(b)} = <b>${fmt(ans)}</b>` });
  });
  gen("kopf.mul", "mal", "Kopfrechnen mal", (r, lvl) => {
    let a, b;
    if (lvl === 1) { a = r.int(3, 12); b = r.int(3, 25); }
    else if (lvl === 2) { a = r.int(2, 9) * r.pick([10, 100]); b = r.int(2, 9) * r.pick([1, 10]); if (r.chance(0.3)) { a = r.int(11, 19); b = r.int(3, 9); } }
    else { a = r.int(2, 9) * r.pick([100, 1000]); b = r.int(2, 9) * r.pick([10, 100, 1000]); }
    if (r.chance(0.5)) [a, b] = [b, a];
    const ans = a * b;
    const za = String(a).match(/0*$/)[0].length, zb = String(b).match(/0*$/)[0].length;
    return numTask({ q: `Rechne im Kopf: <span class="big">${fmt(a)} · ${fmt(b)}</span>`, ans, hints: [za + zb ? `Rechne ohne die Nullen: ${a / Math.pow(10, za)} · ${b / Math.pow(10, zb)} = ${(a / Math.pow(10, za)) * (b / Math.pow(10, zb))}. Dann ${za + zb} Null${za + zb > 1 ? "en" : ""} anhängen.` : "Zerlege eine Zahl: z. B. 4 · 19 = 4 · 20 − 4."], solution: `${fmt(a)} · ${fmt(b)} = <b>${fmt(ans)}</b>` });
  });
  gen("kopf.div", "div", "Kopfrechnen geteilt (mit Rest)", (r, lvl) => {
    let b = r.int(2, 9), q = r.int(2, 12), rest = 0;
    if (lvl >= 2 && r.chance(0.5)) rest = r.int(1, b - 1);
    if (lvl === 2 && r.chance(0.4)) { b = r.int(11, 19); q = r.int(2, 9); rest = r.chance(0.5) ? r.int(1, b - 1) : 0; }
    if (lvl === 3) { const z = r.pick([10, 100]); b = r.int(2, 9) * z; q = r.int(2, 90); rest = 0; }
    const a = q * b + rest;
    return T({
      kind: "num", withRest: true, q: `Rechne im Kopf${rest || lvl > 1 ? ". Gib, falls nötig, den Rest an" : ""}: <span class="big">${fmt(a)} : ${fmt(b)}</span>`,
      check: (inp) => ({ ok: parseNum(inp.q) === q && (parseNum(inp.r || "0") || 0) === rest }),
      answer: `${fmt(q)}${rest ? " Rest " + rest : ""}`,
      hints: [`Welche Zahl mal ${fmt(b)} kommt nah an ${fmt(a)} heran?`, `${q} · ${fmt(b)} = ${fmt(q * b)}${rest ? `, es fehlen noch ${rest} bis ${fmt(a)} → Rest` : ""}`],
      solution: `${fmt(a)} : ${fmt(b)} = <b>${q}</b>${rest ? ` Rest <b>${rest}</b>` : ""}, denn ${q} · ${fmt(b)}${rest ? ` + ${rest}` : ""} = ${fmt(a)}`,
    });
  });
  gen("mal.faktor", "mal", "Faktor verändern", (r, lvl) => {
    if (lvl === 3 || r.chance(0.3)) {
      const cases = [["den ersten Faktor verdoppelt", "verdoppelt sich das Produkt"], ["beide Faktoren verdoppelt", "vervierfacht sich das Produkt"], ["einen Faktor verdoppelt und den anderen halbiert", "bleibt das Produkt gleich"], ["den ersten Faktor vervierfacht und den zweiten halbiert", "verdoppelt sich das Produkt"], ["einen Faktor verzehnfacht", "verzehnfacht sich das Produkt"], ["beide Faktoren halbiert", "wird das Produkt geviertelt"]];
      const k = r.int(0, cases.length - 1), opts = r.shuffle(["verdoppelt sich das Produkt", "vervierfacht sich das Produkt", "bleibt das Produkt gleich", "verzehnfacht sich das Produkt", "wird das Produkt geviertelt", "halbiert sich das Produkt"]).filter((o) => o !== cases[k][1]).slice(0, 3);
      opts.splice(r.int(0, 3), 0, cases[k][1]);
      return choiceTask({ q: `Wenn man ${cases[k][0]}, dann …`, options: opts, correct: opts.indexOf(cases[k][1]), hints: ["Probiere es mit einem Beispiel aus, z. B. 4 · 6 = 24."], solution: `… <b>${cases[k][1]}</b>. Beispiel mit 4 · 6 = 24.` });
    }
    const a = r.int(2, 9), b = r.int(11, 49), p = a * b, z = r.pick([10, 100, 1000]);
    const which = r.chance(0.5);
    const ans = p * z;
    return numTask({ q: `Es ist ${a} · ${b} = ${p}. Berechne: <span class="big">${which ? `${fmt(a * z)} · ${b}` : `${a} · ${fmt(b * z)}`}</span>`, ans, hints: [`Ein Faktor wurde ${z === 10 ? "verzehnfacht" : z === 100 ? "verhundertfacht" : "vertausendfacht"} – was passiert mit dem Produkt?`], solution: `Das Produkt wird auch ${z === 10 ? "verzehnfacht" : z === 100 ? "verhundertfacht" : "vertausendfacht"}: <b>${fmt(ans)}</b>` });
  });
  gen("rechnen.null", "div", "Rechnen mit 0 und 1", (r) => {
    const a = r.int(2, 999);
    const c = r.pick([[`${a} · 0`, 0], [`0 · ${a}`, 0], [`0 : ${a}`, 0], [`${a} : 0`, null], [`${a} : 1`, a], [`${a} · 1`, a], [`${a} − 0`, a], [`0 : 0`, null], [`${a} : ${a}`, 1]]);
    const opts = r.shuffle([String(c[1] == null ? a : c[1]), "0", "1", String(a)].filter((v, i, s) => s.indexOf(v) === i)).slice(0, 3);
    if (c[1] != null && !opts.includes(String(c[1]))) opts[0] = String(c[1]);
    opts.push("nicht möglich");
    const correct = c[1] == null ? opts.length - 1 : opts.indexOf(String(c[1]));
    return choiceTask({ q: `Berechne, falls möglich: <span class="big">${c[0]}</span>`, options: opts.map((o) => (/^\d+$/.test(o) ? fmt(Number(o)) : o)), correct, hints: ["Durch 0 kann man nicht teilen: Keine Zahl mal 0 ergibt eine Zahl ungleich 0.", "Mal 1 und geteilt durch 1 lässt die Zahl gleich."], solution: c[1] == null ? "Durch 0 kann man <b>nicht</b> dividieren." : `${c[0]} = <b>${c[1]}</b>` });
  }, { lvls: [1, 2] });

  // ===== Platzhalter, Zahlenmauern, Rechenketten =====
  gen("platz.finden", "platz", "Die fehlende Zahl (Platzhalter)", (r, lvl) => {
    const op = r.pick(["+", "-", "*", "/"]);
    let a, b, c;
    if (op === "+") { a = lvl === 1 ? r.int(10, 200) : r.int(100, 9999); b = lvl === 1 ? r.int(10, 200) : r.int(100, 9999); c = a + b; }
    if (op === "-") { a = lvl === 1 ? r.int(50, 300) : r.int(500, 9999); b = r.int(10, a - 1); c = a - b; }
    if (op === "*") { a = lvl === 1 ? r.int(2, 12) : r.int(11, 99); b = lvl === 1 ? r.int(2, 12) : lvl === 2 ? r.int(11, 99) : r.int(101, 600); c = a * b; }
    if (op === "/") { b = lvl === 1 ? r.int(2, 9) : r.int(11, 60); c = lvl === 1 ? r.int(2, 12) : r.int(11, lvl === 3 ? 600 : 99); a = b * c; }
    const pos = r.int(0, 2);
    const parts = [a, b, c].map((x, i) => (i === pos ? '<span class="kbx">?</span>' : fmt(x)));
    const ans = [a, b, c][pos];
    const umk = {
      "+": [`${fmt(c)} − ${fmt(b)}`, `${fmt(c)} − ${fmt(a)}`, `${fmt(a)} + ${fmt(b)}`],
      "-": [`${fmt(c)} + ${fmt(b)}`, `${fmt(a)} − ${fmt(c)}`, `${fmt(a)} − ${fmt(b)}`],
      "*": [`${fmt(c)} : ${fmt(b)}`, `${fmt(c)} : ${fmt(a)}`, `${fmt(a)} · ${fmt(b)}`],
      "/": [`${fmt(c)} · ${fmt(b)}`, `${fmt(a)} : ${fmt(c)}`, `${fmt(a)} : ${fmt(b)}`],
    }[op][pos];
    return numTask({ q: `Ergänze die fehlende Zahl: <span class="big">${parts[0]} ${opSym[op]} ${parts[1]} = ${parts[2]}</span>`, ans, hints: ["Nutze die Umkehraufgabe.", `Umkehraufgabe: ${umk}`], solution: `${umk} = <b>${fmt(ans)}</b>` });
  });
  gen("platz.worte", "platz", "Welche Zahl muss man …?", (r, lvl) => {
    const k = r.int(0, 4);
    let q, ans, sol;
    if (k === 0) { const a = r.pick([1000, 10000, 100000]), c = r.int(10, a / 2); q = `Welche Zahl muss man von ${fmt(a)} subtrahieren, um ${fmt(c)} zu erhalten?`; ans = a - c; sol = `${fmt(a)} − ${fmt(c)}`; }
    if (k === 1) { const a = r.int(11, 49), c = a * r.int(12, 300); q = `Mit welcher Zahl muss man ${a} multiplizieren, um ${fmt(c)} zu erhalten?`; ans = c / a; sol = `${fmt(c)} : ${a}`; }
    if (k === 2) { const a = r.int(100, 999999), t = r.pick([1000, 1e6, 1e9].filter((x) => x > a)); q = `Wie viel fehlt von ${fmt(a)} zu ${zahlwort(t).replace(/^eine /, "einer ").replace("Million", "Million").replace("Milliarde", "Milliarde")}?`; ans = t - a; sol = `${fmt(t)} − ${fmt(a)}`; }
    if (k === 3) { const a = r.int(20, 900), b = r.int(20, 900); q = `Zu welcher Zahl muss man ${a} addieren, um ${a + b} zu erhalten?`; ans = b; sol = `${a + b} − ${a}`; }
    if (k === 4) { const z = r.pick([999, 9999, 99999]), a = r.int(100, z - 10); q = `Wie viel muss man zu ${fmt(a)} addieren, um die größte ${String(z).length}-stellige Zahl zu erhalten?`; ans = z - a; sol = `${fmt(z)} − ${fmt(a)}`; }
    return numTask({ q, ans, hints: ["Schreibe die Aufgabe mit einem Kästchen als Platzhalter auf.", "Dann hilft die Umkehraufgabe."], solution: `${sol} = <b>${fmt(ans)}</b>` });
  }, { lvls: [2, 3] });
  gen("platz.mauer", "platz", "Zahlenmauern", (r, lvl) => {
    const mul = lvl === 3 || (lvl === 2 && r.chance(0.4));
    const base = mul ? [r.int(2, 9), r.int(2, 6), r.int(2, 9)] : Array.from({ length: lvl === 1 ? 3 : 4 }, () => r.int(lvl === 1 ? 5 : 20, lvl === 1 ? 60 : 300));
    const rows = [base];
    while (rows[0].length > 1) { const b = rows[0]; rows.unshift(b.slice(1).map((x, i) => (mul ? b[i] * x : b[i] + x))); }
    // Welche Felder sind leer? Unten bleibt meist gefüllt; bei Stufe 3 fehlt auch unten etwas
    const cells = [], shape = rows.map((row, ri) => row.map((v, ci) => {
      const bottom = ri === rows.length - 1;
      const hide = bottom ? lvl >= 2 && ci === 1 && r.chance(0.5) : !(ri === rows.length - 2 && ci === 0 && lvl >= 2);
      return hide ? { hole: cells.push({ label: "", ans: String(v) }) - 1 } : { v };
    }));
    // Bei leerem Feld unten muss das Feld darüber bekannt sein
    if (shape[rows.length - 1].some((c) => c.hole != null)) { const above = shape[rows.length - 2][0]; if (above.hole != null) { const idx = above.hole; above.v = Number(cells[idx].ans); cells[idx].drop = true; delete above.hole; } }
    const real = cells.map((c, i) => ({ c, i })).filter((x) => !x.c.drop);
    const remap = {}; real.forEach((x, j) => { remap[x.i] = j; });
    shape.forEach((row) => row.forEach((c) => { if (c.hole != null) c.hole = remap[c.hole]; }));
    const cl = real.map((x) => x.c);
    return T({
      kind: "mauer", shape, cells: cl, q: `Vervollständige die Zahlenmauer. Jeder Stein ist ${mul ? "das <b>Produkt</b>" : "die <b>Summe</b>"} der beiden Steine darunter.`,
      check: (inp) => { const c = cl.map((x, i) => parseNum(inp[i]) === Number(x.ans)); return { ok: c.every(Boolean), cells: c }; },
      answer: rows.map((row) => row.map(fmt).join(" | ")).join(" / "), hints: [mul ? "Fehlt unten ein Stein? Teile den Stein darüber durch den bekannten Nachbarn." : "Fehlt unten ein Stein? Rechne: Stein darüber minus Nachbarstein.", "Arbeite dich Reihe für Reihe nach oben."],
      solution: `<div class="mauer sol">${rows.map((row) => `<div class="mrow">${row.map((v) => `<span>${fmt(v)}</span>`).join("")}</div>`).join("")}</div>`,
    });
  });
  gen("platz.kette", "platz", "Rechenketten", (r, lvl) => {
    let v = lvl === 1 ? r.int(5, 90) : r.int(100, 9000);
    const ops = [], vals = [];
    for (let i = 0; i < (lvl === 1 ? 3 : 4); i++) {
      let op = r.pick(lvl === 1 ? ["+", "-", "*"] : ["+", "-", "*", "/"]), n;
      if (op === "/") { const ds = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25].filter((d) => v % d === 0); if (ds.length) n = r.pick(ds); else op = "+"; }
      if (op === "+") n = lvl === 1 ? r.int(5, 99) : r.int(50, 9999);
      if (op === "-") n = r.int(1, Math.max(1, Math.floor(v * 0.8)));
      if (op === "*") n = v > 5000 ? 2 : r.int(2, lvl === 1 ? 5 : 9);
      v = op === "+" ? v + n : op === "-" ? v - n : op === "*" ? v * n : v / n;
      ops.push({ op, n }); vals.push(v);
    }
    const start = (() => { let x = vals[vals.length - 1]; for (let i = ops.length - 1; i >= 0; i--) { const { op, n } = ops[i]; x = op === "+" ? x - n : op === "-" ? x + n : op === "*" ? x / n : x * n; } return x; })();
    const cells = vals.map((x) => ({ label: "", ans: String(x) }));
    return T({
      kind: "kette", start, ops, cells, q: "Ergänze die fehlenden Zahlen in der Rechenkette.",
      check: (inp) => { const c = cells.map((x, i) => parseNum(inp[i]) === Number(x.ans)); return { ok: c.every(Boolean), cells: c }; },
      answer: [start, ...vals].map(fmt).join(" → "), hints: ["Rechne Schritt für Schritt. Das Ergebnis eines Kästchens ist der Start für das nächste."], solution: [fmt(start), ...ops.map((o, i) => `${opSym[o.op]} ${fmt(o.n)} → <b>${fmt(vals[i])}</b>`)].join(" "),
    });
  });

  // ===== Fachbegriffe =====
  const BEGRIFFE = { "+": ["Summand", "Summand", "Summe", "Addition", "addieren"], "-": ["Minuend", "Subtrahend", "Differenz", "Subtraktion", "subtrahieren"], "*": ["Faktor", "Faktor", "Produkt", "Multiplikation", "multiplizieren"], "/": ["Dividend", "Divisor", "Quotient", "Division", "dividieren"] };
  const ALLE = ["Summand", "Summe", "Minuend", "Subtrahend", "Differenz", "Faktor", "Produkt", "Dividend", "Divisor", "Quotient"];
  gen("begriffe.name", "begriffe", "Wie heißt die Zahl?", (r) => {
    const op = r.pick(["+", "-", "*", "/"]);
    let a = r.int(12, 99), b = r.int(2, 30); if (op === "-" && b > a) [a, b] = [b, a];
    if (op === "/") a = a * b;
    const c = op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b;
    const pos = r.int(0, 2);
    const parts = [a, b, c].map((x, i) => (i === pos ? `<span class="kbx hl">${fmt(x)}</span>` : fmt(x)));
    let ans = BEGRIFFE[op][pos];
    const label = op === "+" && pos < 2 ? `${pos + 1}. Summand` : op === "*" && pos < 2 ? `${pos + 1}. Faktor` : ans;
    const opts = r.shuffle(ALLE.filter((x) => x !== ans)).slice(0, 3);
    opts.splice(r.int(0, 3), 0, ans);
    return choiceTask({ q: `Wie heißt die markierte Zahl? <span class="big">${parts[0]} ${opSym[op]} ${parts[1]} = ${parts[2]}</span>`, options: opts, correct: opts.indexOf(ans), hints: [op === "-" ? "Eselsbrücke: Im Wort „minus“ steht das m vor dem s – Minuend vor dem Subtrahend." : op === "/" ? "Dividend : Divisor = Quotient – „Dividend“ ist die Zahl, die geteilt wird." : "Das Ergebnis hat einen eigenen Namen."], solution: `Das ist der <b>${label}</b>.<br>${BEGRIFFE[op].slice(0, 3).join(" " + opSym[op] + " ").replace(/ ([^ ]+)$/, " = $1")}` });
  });
  gen("begriffe.satz", "begriffe", "Rechnen mit Worten", (r, lvl) => {
    const k = r.int(0, lvl === 1 ? 4 : 7);
    const a = r.int(20, 300), b = r.int(2, 19), c = r.int(2, 9);
    const L = [
      () => [`Berechne die Summe von ${a} und ${b * 7}.`, a + b * 7, `${a} + ${b * 7}`],
      () => [`Berechne die Differenz von ${a + 100} und ${b * 3}.`, a + 100 - b * 3, `${a + 100} − ${b * 3}`],
      () => [`Berechne das Produkt von ${b} und ${c * 5}.`, b * c * 5, `${b} · ${c * 5}`],
      () => [`Berechne den Quotienten von ${b * c * 3} und ${c}.`, b * 3, `${b * c * 3} : ${c}`],
      () => [`Subtrahiere ${b * 4} von ${a + 50}.`, a + 50 - b * 4, `${a + 50} − ${b * 4} (Achtung: von wem wird abgezogen?)`],
      () => [`Multipliziere die Summe von ${b} und ${c} mit ${c + 1}.`, (b + c) * (c + 1), `(${b} + ${c}) · ${c + 1}`],
      () => [`Dividiere die Summe von ${b * c * 2} und ${c * 3} durch ${c}.`, (b * c * 2 + c * 3) / c, `(${b * c * 2} + ${c * 3}) : ${c}`],
      () => [`Vermindere ${zahlwort(a + 300)} um ${zahlwort(b * 10)}.`, a + 300 - b * 10, `${a + 300} − ${b * 10}`],
    ];
    const [q, ans, sol] = L[k]();
    return numTask({ q, ans, hints: ["Schreibe zuerst den Rechenausdruck auf: Summe → +, Differenz → −, Produkt → ·, Quotient → :", "„Subtrahiere A von B“ heißt: B − A."], solution: `${sol} = <b>${fmt(ans)}</b>` });
  });
  gen("begriffe.luecke", "begriffe", "Lückentext Fachbegriffe", (r) => {
    const S = [
      ["Das Ergebnis einer Addition heißt …", "Summe"], ["Das Ergebnis einer Subtraktion heißt …", "Differenz"], ["Das Ergebnis einer Multiplikation heißt …", "Produkt"], ["Das Ergebnis einer Division heißt …", "Quotient"],
      ["Die Zahl vor dem Minuszeichen heißt …", "Minuend"], ["Die Zahl hinter dem Minuszeichen heißt …", "Subtrahend"], ["Die Zahl, durch die geteilt wird, heißt …", "Divisor"], ["Die Zahl, die geteilt wird, heißt …", "Dividend"],
      ["Die Zahlen, die man addiert, heißen …", "Summanden"], ["Die Zahlen, die man multipliziert, heißen …", "Faktoren"],
      ["Wenn man das Ergebnis ungefähr ermitteln will, macht man eine …", "Überschlagsrechnung"], ["Die Rechenart mit dem Ergebnis „Quotient“ heißt …", "Division"], ["Die Rechenart mit dem Ergebnis „Differenz“ heißt …", "Subtraktion"],
    ];
    const [q, ans] = r.pick(S);
    const pool = ["Summe", "Differenz", "Produkt", "Quotient", "Minuend", "Subtrahend", "Divisor", "Dividend", "Summanden", "Faktoren", "Überschlagsrechnung", "Division", "Subtraktion", "Addition", "Multiplikation"];
    const opts = r.shuffle(pool.filter((x) => x !== ans)).slice(0, 3); opts.splice(r.int(0, 3), 0, ans);
    return choiceTask({ q, options: opts, correct: opts.indexOf(ans), hints: ["Summe (+), Differenz (−), Produkt (·), Quotient (:)"], solution: `<b>${ans}</b>` });
  });

  // ===== Zweiersystem =====
  const binTafel = (n) => { const s = toBin(n), names = ["1er", "2er", "4er", "8er", "16er", "32er", "64er", "128er"]; let h = '<table class="stafel"><tr>'; for (let i = s.length - 1; i >= 0; i--) h += `<th>${names[i]}</th>`; h += "</tr><tr>"; for (const c of s) h += `<td>${c}</td>`; return h + "</tr></table>"; };
  const binSum = (n) => toBin(n).split("").map((c, i, s) => `${c}·${Math.pow(2, s.length - 1 - i)}`).join(" + ");
  gen("zwei.zudez", "zwei", "Zweiersystem → Zehnersystem", (r, lvl) => {
    const n = lvl === 1 ? r.int(2, 31) : lvl === 2 ? r.int(16, 63) : r.int(64, 255);
    return numTask({ q: `Schreibe im Zehnersystem: <span class="big">${bin(n)}</span>`, ans: n, hints: ["Stellenwerte im Zweiersystem von rechts: 1, 2, 4, 8, 16, 32, 64 …", "Addiere die Stellenwerte, unter denen eine 1 steht."], solution: `${binSum(n)} = <b>${n}</b>${binTafel(n)}` });
  });
  gen("zwei.zubin", "zwei", "Zehnersystem → Zweiersystem", (r, lvl) => {
    const n = lvl === 1 ? r.int(2, 31) : lvl === 2 ? r.int(16, 63) : r.int(64, 200);
    return T({ kind: "text", inputmode: "numeric", q: `Schreibe im Zweiersystem: <span class="big">${n}</span>`, answer: toBin(n), check: (s) => ({ ok: parseBin(s) === n && /^\(?[01]+\)?/.test(String(s).trim()) && String(s).replace(/[^01]/g, "").replace(/^0+/, "") === toBin(n) }), hints: ["Welcher Stellenwert (1, 2, 4, 8, 16, 32, 64 …) passt gerade noch in die Zahl?", "Nimm den größten passenden Stellenwert, zieh ihn ab, dann den nächsten …"], solution: `${n} = ${binSum(n)} = <b>${bin(n)}</b>${binTafel(n)}` });
  });
  gen("zwei.nachbar", "zwei", "Vorgänger und Nachfolger im Zweiersystem", (r, lvl) => {
    const n = r.int(2, lvl === 1 ? 31 : 127), vor = r.chance(0.5), ans = vor ? n - 1 : n + 1;
    return T({ kind: "text", inputmode: "numeric", q: `Gib den <b>${vor ? "Vorgänger" : "Nachfolger"}</b> im Zweiersystem an: <span class="big">${bin(n)}</span>`, answer: toBin(ans), check: (s) => ({ ok: String(s).replace(/[^01]/g, "").replace(/^0+/, "") === toBin(ans) }), hints: ["Rechne die Zahl ins Zehnersystem um, dann ±1, dann zurück.", vor ? "Oder direkt: Hinten wird aus …1000 ein …0111." : "Oder direkt: Hinten wird aus …0111 ein …1000."], solution: `${bin(n)} = ${n}, ${vor ? "Vorgänger" : "Nachfolger"} ${ans} = <b>${bin(ans)}</b>` });
  });
  gen("zwei.add", "zwei", "Im Zweiersystem addieren", (r, lvl) => {
    const a = r.int(lvl === 2 ? 5 : 20, lvl === 2 ? 31 : 63), b = r.int(3, lvl === 2 ? 31 : 63);
    return T({ kind: "text", inputmode: "numeric", q: `Berechne im Zweiersystem: <span class="big">${bin(a)} + ${bin(b)}</span>`, answer: toBin(a + b), check: (s) => ({ ok: String(s).replace(/[^01]/g, "").replace(/^0+/, "") === toBin(a + b) }), hints: ["Wie schriftlich addieren, aber: 1 + 1 = (10)₂ → schreibe 0, übertrage 1.", "1 + 1 + 1 = (11)₂ → schreibe 1, übertrage 1."], solution: `${bin(a)} + ${bin(b)} = <b>${bin(a + b)}</b> (Probe: ${a} + ${b} = ${a + b})` });
  }, { lvls: [2, 3] });
  gen("zwei.aussage", "zwei", "Wahr oder falsch? (Zweiersystem)", (r) => {
    const n = r.int(9, 120);
    const S = [
      [`Die Zahl ${bin(n)} ist gerade.`, n % 2 === 0, `Gerade Zahlen enden im Zweiersystem auf 0. ${bin(n)} endet auf ${n % 2}.`],
      ["Hängt man im Zweiersystem eine 0 an, verdoppelt sich die Zahl.", true, "Jede Ziffer rückt eine Stelle nach links – jeder Stellenwert verdoppelt sich."],
      ["Hängt man im Zweiersystem eine 0 an, verzehnfacht sich die Zahl.", false, "Im Zweiersystem verdoppelt sich die Zahl (nur im Zehnersystem verzehnfacht sie sich)."],
      ["Alle Zahlen von 64 bis 127 haben im Zweiersystem 7 Stellen.", true, "64 = (1000000)₂ und 127 = (1111111)₂ – beide 7 Stellen."],
      ["Die größte vierstellige Zahl im Zweiersystem ist 15.", true, "(1111)₂ = 8 + 4 + 2 + 1 = 15"],
      ["Die kleinste fünfstellige Zahl im Zweiersystem ist 32.", false, "(10000)₂ = 16"],
      [`${n} hat im Zweiersystem ${toBin(n).length} Stellen.`, true, `${n} = ${bin(n)}`],
      [`${n} hat im Zweiersystem ${toBin(n).length + 1} Stellen.`, false, `${n} = ${bin(n)} hat ${toBin(n).length} Stellen.`],
      ["Im Zweiersystem gibt es nur die Ziffern 0 und 1.", true, "Richtig – deshalb heißt es auch Binärsystem."],
    ];
    const [q, w, why] = r.pick(S);
    return choiceTask({ q: `Wahr oder falsch? <span class="big2">${q}</span>`, options: ["wahr", "falsch"], correct: w ? 0 : 1, hints: ["Probiere es mit einem Beispiel aus."], solution: `<b>${w ? "wahr" : "falsch"}</b> – ${why}` });
  }, { lvls: [2, 3] });

  // ===== Römische Zahlen =====
  const romSplit = (n) => { const parts = []; for (const p of [1000, 100, 10, 1]) { const v = Math.floor(n / p) % 10 * p; if (v) parts.push(v); } return parts; };
  gen("roem.zudez", "roem", "Römisch → Zehnersystem", (r, lvl) => {
    const n = lvl === 1 ? r.int(4, 40) : lvl === 2 ? r.int(40, 400) : r.int(1400, 2030);
    return numTask({ q: `Schreibe im Zehnersystem: <span class="big rom">${toRoman(n)}</span>`, ans: n, hints: ["I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000", "Steht ein kleineres Zeichen links von einem größeren, wird es abgezogen (IX = 9)."], solution: `${romSplit(n).map((p) => `${toRoman(p)} = ${p}`).join(", ")} → <b>${n}</b>` });
  });
  gen("roem.zurom", "roem", "Zehnersystem → Römisch", (r, lvl) => {
    const n = lvl === 1 ? r.int(4, 40) : lvl === 2 ? r.int(40, 400) : r.int(1400, 2030);
    return T({ kind: "text", q: `Schreibe mit römischen Zahlzeichen: <span class="big">${n}</span>`, answer: toRoman(n), upper: true, check: (s) => ({ ok: String(s).toUpperCase().replace(/\s/g, "") === toRoman(n), note: fromRoman(s) === n && String(s).toUpperCase().replace(/\s/g, "") !== toRoman(n) ? "Der Wert stimmt, aber so schreibt man es nicht (höchstens 3 gleiche Zeichen nebeneinander, V/L/D nie links von einem größeren)." : "" }), hints: ["Zerlege die Zahl: Tausender, Hunderter, Zehner, Einer.", romSplit(n).map((p) => `${p} = ${toRoman(p)}`).join(", ")], solution: `${romSplit(n).join(" + ")} = ${romSplit(n).map(toRoman).join(" + ")} = <b>${toRoman(n)}</b>` });
  });
  gen("roem.richtig", "roem", "Welche Schreibweise ist richtig?", (r, lvl) => {
    const n = r.pick([4, 9, 14, 19, 40, 45, 49, 90, 95, 99, 400, 490, 900, 999, 1990, 1994]);
    const wrongs = { 4: ["IIII"], 9: ["VIIII", "VIV"], 14: ["XIIII", "VIX"], 19: ["XVIIII", "IXX"], 40: ["XXXX", "LXL"], 45: ["VL", "XXXXV"], 49: ["IL", "XLVIIII"], 90: ["LXXXX", "XCX"], 95: ["VC", "LXXXXV"], 99: ["IC", "XCVIIII"], 400: ["CCCC", "DCD"], 490: ["XD", "CCCCXC"], 900: ["DCCCC", "CMC"], 999: ["IM", "CMXCVIIII"], 1990: ["MXM", "MCMLXXXX"], 1994: ["MCMXCIIII", "MIVM"] }[n];
    const opts = r.shuffle([toRoman(n), ...wrongs]);
    return choiceTask({ q: `Welche Schreibweise für <b>${n}</b> ist richtig?`, options: opts, correct: opts.indexOf(toRoman(n)), hints: ["I, X und C stehen höchstens dreimal nebeneinander.", "V, L und D stehen nie links von einem größeren Zeichen. Abziehen darf man nur I (vor V, X), X (vor L, C) und C (vor D, M)."], solution: `<b>${toRoman(n)}</b> = ${romSplit(n).join(" + ")}` });
  }, { lvls: [2, 3] });

  // ===== Diagramme =====
  const CATS = [
    ["Umwelt", "Fußball", "Chor", "Schwimmen", "Technik", "Handball"], ["Eis", "Kuchen", "Pudding", "Obst", "Waffeln"], ["Hund", "Katze", "Hase", "Pferd", "Fische"], ["Reh", "Fuchs", "Igel", "Dachs", "Hase"], ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"],
  ];
  function chartData(r, lvl) {
    const names = r.pick(CATS).slice(0, r.int(4, 5));
    const unit = lvl === 1 ? r.pick([1, 2]) : lvl === 2 ? r.pick([2, 5, 10]) : r.pick([5, 20, 50, 100]);
    const k = 12;
    const cats = names.map((n) => ({ name: n, v: unit * r.int(2, k) }));
    const max = unit * (k + 2);
    return { cats, unit, max, horiz: r.chance(0.4), labelEvery: unit === 1 ? 2 : 2 };
  }
  gen("dia.lesen", "dia", "Diagramme lesen", (r, lvl) => {
    const d = chartData(r, lvl);
    const k = r.int(0, 2), a = r.pick(d.cats);
    const yT = d.cats[0].name === "Reh" ? "Länge in cm" : "Anzahl";
    const chart = svgBars({ cats: d.cats, unit: d.unit, max: d.max, horiz: d.horiz, labelEvery: d.labelEvery, yTitle: yT });
    if (k === 0) return numTask({ q: `Lies ab: Welcher Wert gehört zu <b>${a.name}</b>?${chart}`, ans: a.v, hints: [`Eine Kästchenlinie bedeutet hier ${d.unit}. Beschriftet ist jede ${d.labelEvery === 2 ? "zweite" : ""} Linie.`, "Folge dem Ende des Balkens genau zur Achse."], solution: `${a.name}: <b>${a.v}</b>` });
    if (k === 1) { const b = r.pick(d.cats.filter((c) => c !== a)); return numTask({ q: `Um wie viel ist der Wert von <b>${a.name}</b> ${a.v >= b.v ? "größer" : "kleiner"} als der von <b>${b.name}</b>?${chart}`, ans: Math.abs(a.v - b.v), hints: ["Lies beide Werte ab und bilde die Differenz."], solution: `${a.v} und ${b.v}: Differenz <b>${Math.abs(a.v - b.v)}</b>` }); }
    const tot = d.cats.reduce((s, c) => s + c.v, 0);
    return numTask({ q: `Wie groß ist die Summe aller Werte?${chart}`, ans: tot, hints: ["Lies jeden Wert ab und addiere."], solution: d.cats.map((c) => c.v).join(" + ") + ` = <b>${tot}</b>` });
  });
  gen("dia.strich", "dia", "Strichlisten", (r, lvl) => {
    const names = r.pick(CATS).slice(0, 4), vals = names.map(() => r.int(lvl === 1 ? 2 : 4, lvl === 1 ? 12 : 23));
    const tot = vals.reduce((a, b) => a + b, 0), k = r.int(0, 1), i = r.int(0, 3);
    const tab = `<table class="tab">${names.map((n, j) => `<tr><th>${n}</th><td>${tally(vals[j])}</td></tr>`).join("")}</table>`;
    return k === 0 ? numTask({ q: `Wie viele Striche gehören zu <b>${names[i]}</b>?${tab}`, ans: vals[i], hints: ["Ein durchgestrichenes Bündel sind 5 Striche."], solution: `<b>${vals[i]}</b>` })
      : numTask({ q: `Wie viele Kinder haben insgesamt abgestimmt?${tab}`, ans: tot, hints: ["Zähle jede Zeile (Bündel = 5) und addiere."], solution: vals.join(" + ") + ` = <b>${tot}</b>` });
  });
  gen("dia.einteilung", "dia", "Achse sinnvoll einteilen", (r, lvl) => {
    const units = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    const boxes = r.pick([10, 12, 15]);
    const max = r.int(boxes + 1, boxes * (lvl === 1 ? 5 : lvl === 2 ? 20 : 100));
    const fit = units.find((u) => u * boxes >= max);
    const opts = units.filter((u) => u !== fit).filter((u) => Math.abs(units.indexOf(u) - units.indexOf(fit)) <= 2).slice(0, 3);
    opts.splice(r.int(0, opts.length), 0, fit);
    return choiceTask({ q: `Du zeichnest ein Säulendiagramm. Der größte Wert ist <b>${fmt(max)}</b>, die Achse hat <b>${boxes} Kästchen</b> Platz. Welche Einteilung ist am sinnvollsten? (1 Kästchen für …)`, options: opts.map(fmt), correct: opts.indexOf(fit), hints: ["Die größte Säule muss draufpassen: Einteilung · Kästchen ≥ größter Wert.", "Von den passenden nimm die kleinste – dann wird das Diagramm schön groß."], solution: `${fmt(fit)} · ${boxes} = ${fmt(fit * boxes)} ≥ ${fmt(max)} – <b>1 Kästchen für ${fmt(fit)}</b>` });
  });
  gen("dia.saeule", "dia", "Säulenlänge bestimmen", (r, lvl) => {
    const cities = [["Berlin", 3782202], ["Hamburg", 1910160], ["München", 1510378], ["Köln", 1087353], ["Frankfurt", 773068], ["Stuttgart", 632865], ["Düsseldorf", 629047], ["Leipzig", 616093]];
    const [c, n] = r.pick(cities);
    const per = lvl === 3 ? 200000 : lvl === 2 ? 100000 : 1000000;
    const rounded = roundTo(n, per);
    const mm = lvl === 1;
    const ans = rounded / per;
    return numTask({ q: `${c} hat ${fmt(n)} Einwohner. Im Diagramm steht <b>1 ${lvl === 1 ? "cm" : "Kästchen"} für ${fmt(per)}</b> Einwohner. Runde passend: Wie viele ${lvl === 1 ? "cm" : "Kästchen"} hoch wird die Säule?`, ans, hints: [`Runde zuerst auf ${per === 1e6 ? "Millionen" : per === 1e5 ? "Hunderttausender" : "200 000er"}.`, `Dann: gerundete Zahl : ${fmt(per)}`], solution: `${fmt(n)} ≈ ${fmt(rounded)} → ${fmt(rounded)} : ${fmt(per)} = <b>${ans}</b>` });
  });

  // ===== Sachaufgaben =====
  gen("sach.text", "sach", "Sachaufgaben", (r, lvl) => {
    const name = r.pick(["Mia", "Ben", "Lina", "Noah", "Ella", "Paul", "Emma", "Jonas", "Lea", "Finn"]);
    const S = [
      () => { const k = r.int(22, 31), pk = r.int(4, 9), pe = pk + r.int(3, 6); return [`Die ${k} Kinder der Klasse 5b gehen mit ihrer Lehrerin ins Theater. Eine Karte kostet für Kinder ${pk} € und für Erwachsene ${pe} €. Wie viel Euro müssen alle zusammen bezahlen?`, k * pk + pe, `${k} · ${pk} € + ${pe} € = ${k * pk} € + ${pe} € = ${k * pk + pe} €`, "€"]; },
      () => { const E = 2 * r.int(6, 15), tot = 2 * E + 3 * (E / 2); return [`Familie ${r.pick(["Ritter", "Weber", "Klein", "Huber"])} (2 Erwachsene, 3 Kinder) geht in den Zoo. Insgesamt kostet der Eintritt ${tot} €. Für Kinder ist der Eintritt halb so teuer wie für Erwachsene. Wie viel kostet eine Karte für Erwachsene?`, E, `2 Erwachsene + 3 halbe = 3,5 Erwachsenenkarten → ${tot} € : 7 · 2 = ${E} € (Probe: 2 · ${E} + 3 · ${E / 2} = ${tot})`, "€"]; },
      () => { const berg = r.int(1800, 3000), tal = r.int(900, berg - 300); return [`Eine Seilbahn fährt von der Talstation (${fmt(tal)} m) zur Bergstation (${fmt(berg)} m). Wie groß ist der Höhenunterschied?`, berg - tal, `${fmt(berg)} m − ${fmt(tal)} m = ${fmt(berg - tal)} m`, "m"]; },
      () => { const leer = r.int(1300, 1700), max = leer + r.int(400, 700), fahrer = r.int(60, 95), pl = r.pick([12, 14, 15, 18, 20]); const kg = max - leer - fahrer; return [`Herr Schneider will Terrassenplatten mit dem Auto holen. Das Auto wiegt leer ${fmt(leer)} kg und darf höchstens ${fmt(max)} kg wiegen. Er selbst wiegt ${fmt(fahrer)} kg. Eine Platte wiegt ${pl} kg. Wie viele Platten kann er höchstens pro Fahrt mitnehmen?`, Math.floor(kg / pl), `Zuladung: ${fmt(max)} − ${fmt(leer)} − ${fmt(fahrer)} = ${kg} kg. ${kg} : ${pl} = ${Math.floor(kg / pl)} Rest ${kg % pl} → höchstens ${Math.floor(kg / pl)} Platten`, "Platten"]; },
      () => { const kids10 = r.int(40, 90), kids11 = r.int(8, 30); return [`In der 5. Klassenstufe sind ${kids10} Kinder 10 Jahre und ${kids11} Kinder 11 Jahre alt. Wie alt sind alle Kinder zusammen?`, kids10 * 10 + kids11 * 11, `${kids10} · 10 + ${kids11} · 11 = ${kids10 * 10} + ${kids11 * 11} = ${kids10 * 10 + kids11 * 11}`, "Jahre"]; },
      () => { const all = r.int(30000, 80000), sitz = r.int(Math.floor(all * 0.6), all - 3000); return [`Ein Stadion hat Platz für ${fmt(all)} Zuschauer, davon sind ${fmt(sitz)} Sitzplätze. Der Rest sind Stehplätze. Wie viele Stehplätze hat das Stadion?`, all - sitz, `${fmt(all)} − ${fmt(sitz)} = ${fmt(all - sitz)}`, "Stehplätze"]; },
      () => { const reihen = r.int(15, 30), pl = r.int(10, 20); return [`Im Festsaal gibt es links und rechts vom Mittelgang jeweils ${reihen} Reihen mit ${pl} Plätzen. Wie viele Sitzplätze hat der Saal?`, 2 * reihen * pl, `2 · ${reihen} · ${pl} = ${2 * reihen * pl}`, "Plätze"]; },
      () => { const preis = r.int(3, 6), abo = preis * 6 - r.int(2, 6); return [`${name}s Lieblingszeitschrift erscheint alle zwei Monate und kostet ${preis} €. Im Abo zahlt ${name} im Jahr ${abo} €. Wie viel spart ${name} durch das Abo?`, 6 * preis - abo, `Ein Jahr: 6 Hefte · ${preis} € = ${6 * preis} €. ${6 * preis} € − ${abo} € = ${6 * preis - abo} €`, "€"]; },
      () => { const a = r.int(5000000, 9000000), b = a + r.int(3000000, 8000000); const d = b - a; return [`Anfang des Jahres gab es etwa ${fmt(a)} Nutzer, am Ende ${fmt(b)}. Wie viele kamen hinzu? Gib das Ergebnis auf Millionen gerundet an.`, roundTo(d, 1e6), `${fmt(b)} − ${fmt(a)} = ${fmt(d)} ≈ ${fmt(roundTo(d, 1e6))}`, ""]; },
      () => { const cent = r.int(150, 990), euro = r.int(10, 30); return [`${name} hat ${cent} Cent-Stücke gesammelt. Wie viele fehlen noch, bis ${name} ${euro} € in Cent besitzt?`, euro * 100 - cent, `${euro} € = ${euro * 100} Cent. ${euro * 100} − ${cent} = ${euro * 100 - cent}`, "Cent-Stücke"]; },
      () => { const s = r.int(150, 300), z = r.int(30, 45), b = r.int(50, 70); return [`Ein Buch hat ${s} Seiten. Jede Seite hat etwa ${z} Zeilen, jede Zeile etwa ${b} Buchstaben. Wie viele Buchstaben enthält das Buch etwa? (Rechne genau mit diesen Zahlen.)`, s * z * b, `${s} · ${z} · ${b} = ${fmt(s * z * b)}`, "Buchstaben"]; },
    ];
    const tbl = () => {
      const C = ["Stuttgart", "Frankfurt", "Dortmund", "Hamburg", "Hannover", "Kassel"];
      const D = { "Stuttgart|Frankfurt": 217, "Stuttgart|Dortmund": 451, "Stuttgart|Hamburg": 668, "Stuttgart|Hannover": 526, "Stuttgart|Kassel": 366, "Frankfurt|Dortmund": 264, "Frankfurt|Hamburg": 495, "Frankfurt|Hannover": 352, "Frankfurt|Kassel": 193, "Dortmund|Hamburg": 343, "Dortmund|Hannover": 208, "Dortmund|Kassel": 165, "Hamburg|Hannover": 154, "Hamburg|Kassel": 307, "Hannover|Kassel": 164 };
      const d = (a, b) => D[a + "|" + b] || D[b + "|" + a];
      const route = r.shuffle(C).slice(0, lvl === 1 ? 3 : 4);
      let sum = 0; for (let i = 1; i < route.length; i++) sum += d(route[i - 1], route[i]);
      const t = `<table class="tab dist"><tr><th></th>${C.map((c) => `<th>${c}</th>`).join("")}</tr>${C.map((a) => `<tr><th>${a}</th>${C.map((b) => `<td>${a === b ? "" : d(a, b)}</td>`).join("")}</tr>`).join("")}</table>`;
      return [`Autobahn-Entfernungen in km. Wie viele Kilometer ist die Tour <b>${route.join(" – ")}</b> lang?${t}`, sum, route.slice(1).map((c, i) => `${d(route[i], c)}`).join(" + ") + ` = ${sum} km`, "km"];
    };
    const [q, ans, sol, unit] = r.chance(0.15) ? tbl() : r.pick(S)();
    return numTask({ q, ans, unit, pts: 3, hints: ["Lies genau: Was ist gegeben, was ist gesucht? Unterstreiche die Zahlen.", "Schreibe zuerst den Rechenweg (Rechenausdruck) auf, dann rechne."], solution: `${sol}<br>Antwort: <b>${fmt(ans)}${unit ? " " + unit : ""}</b>` });
  });
  gen("div.sach", "sach", "Division mit Rest im Alltag", (r, lvl) => {
    const S = [
      () => { const n = r.int(500, 2000), k = r.pick([6, 8, 12, 20, 24]); return [`In einer Molkerei werden ${fmt(n)} Flaschen in ${k}er-Kästen gepackt. Wie viele Kästen werden <b>ganz</b> voll?`, Math.floor(n / k), `${fmt(n)} : ${k} = ${Math.floor(n / k)} Rest ${n % k} → ${Math.floor(n / k)} volle Kästen (${n % k} Flaschen bleiben übrig)`]; },
      () => { const k = r.int(5, 12), n = k * r.int(4, 12) + r.int(1, k - 1); return [`Ein Lkw kann ${k} Paletten laden. Wie oft muss er fahren, um ${n} Paletten zu transportieren?`, Math.ceil(n / k), `${n} : ${k} = ${Math.floor(n / k)} Rest ${n % k} → für den Rest braucht er noch eine Fahrt: ${Math.ceil(n / k)} Fahrten`]; },
      () => { const k = r.int(22, 31), p = r.int(8, 25); return [`Für die ${k} Kinder einer Klasse kostet der Ausflug insgesamt ${k * p} €. Wie viel muss jedes Kind bezahlen?`, p, `${k * p} € : ${k} = ${p} €`]; },
      () => { const k = r.pick([4, 5, 6, 8]), n = k * r.int(5, 30) + r.int(1, k - 1); return [`${n} Kinder fahren ins Schullandheim. In ein Zimmer passen ${k} Kinder. Wie viele Zimmer braucht man mindestens?`, Math.ceil(n / k), `${n} : ${k} = ${Math.floor(n / k)} Rest ${n % k} → ${Math.ceil(n / k)} Zimmer`]; },
      () => { const n = r.int(1000, 5000), k = r.pick([25, 50, 100]); return [`${fmt(n)} Dosen werden verpackt, ${k} in eine Schachtel. Wie viele Schachteln braucht man, damit alle Dosen verpackt sind?`, Math.ceil(n / k), `${fmt(n)} : ${k} = ${Math.floor(n / k)} Rest ${n % k}${n % k ? ` → eine Schachtel mehr: ${Math.ceil(n / k)}` : ""}`]; },
    ];
    const [q, ans, sol] = r.pick(S)();
    return numTask({ q, ans, pts: 2, hints: ["Rechne mit Rest. Dann überlege: Muss ich für den Rest auf- oder abrunden?"], solution: sol });
  });

  // ===== Extra: Längen =====
  const U = { mm: 1, cm: 10, dm: 100, m: 1000, km: 1000000 };
  gen("laengen.umrechnen", "laengen", "Längen umrechnen", (r, lvl) => {
    const units = ["mm", "cm", "dm", "m", "km"];
    let from, to, v;
    if (lvl === 1) { const i = r.int(0, 3); [from, to] = r.chance(0.5) ? [units[i + 1], units[i]] : [units[i], units[i + 1]]; }
    else { from = r.pick(units); to = r.pick(units.filter((u) => u !== from)); }
    const up = U[from] >= U[to], f = up ? U[from] / U[to] : U[to] / U[from];
    let ans;
    if (up) { v = f >= 1e5 ? r.int(1, 9) : r.int(2, 999); ans = v * f; }
    else { ans = f >= 1e5 ? r.int(1, 19) : r.int(2, 99); v = ans * f; }
    return numTask({ q: `Schreibe in <b>${to}</b>: <span class="big">${fmt(v)} ${from}</span>`, ans, unit: to, hints: ["1 km = 1000 m, 1 m = 10 dm, 1 dm = 10 cm, 1 cm = 10 mm", up ? "In eine kleinere Einheit → die Zahl wird größer (mal)." : "In eine größere Einheit → die Zahl wird kleiner (geteilt)."], solution: `${fmt(v)} ${from} = <b>${fmt(ans)} ${to}</b>` });
  });
  gen("laengen.gemischt", "laengen", "Gemischte Längen", (r) => {
    const big = r.pick(["m", "km"]), small = big === "m" ? "cm" : "m";
    const a = r.int(1, 15), b = r.int(1, big === "m" ? 99 : 999);
    return numTask({ q: `Schreibe in <b>${small}</b>: <span class="big">${a} ${big} ${b} ${small}</span>`, ans: a * (U[big] / U[small]) + b, unit: small, hints: [`1 ${big} = ${U[big] / U[small]} ${small}`], solution: `${a} ${big} = ${fmt(a * (U[big] / U[small]))} ${small}, + ${b} ${small} = <b>${fmt(a * (U[big] / U[small]) + b)} ${small}</b>` });
  });

  // ---------- Themen ----------
  const TOPICS = [
    { id: "strahl", name: "Zahlenstrahl & Ordnen", icon: "📏", lern: true },
    { id: "stellen", name: "Stellentafel & Zahlwörter", icon: "🔢", lern: true },
    { id: "runden", name: "Runden", icon: "🎯", lern: true },
    { id: "addsub", name: "Schriftlich plus & minus", icon: "➕", lern: true },
    { id: "mal", name: "Multiplizieren", icon: "✖️", lern: true },
    { id: "div", name: "Dividieren", icon: "➗", lern: true },
    { id: "platz", name: "Platzhalter, Mauern & Ketten", icon: "🧱", lern: true },
    { id: "begriffe", name: "Fachbegriffe", icon: "📖", lern: true },
    { id: "sach", name: "Sachaufgaben", icon: "🧺", lern: true },
    { id: "zwei", name: "Zweiersystem", icon: "💡", lern: true },
    { id: "roem", name: "Römische Zahlen", icon: "🏛️", lern: true },
    { id: "dia", name: "Diagramme", icon: "📊", lern: true },
    { id: "laengen", name: "Extra: Längen", icon: "📐", lern: false },
  ];
  TOPICS.forEach((t) => { t.gens = Object.values(G).filter((g) => g.topic === t.id).map((g) => g.id); });

  function make(genId, lvl, seed) {
    const g = G[genId];
    if (!g) throw new Error("Unbekannter Generator " + genId);
    const L = g.lvls.includes(lvl) ? lvl : g.lvls.reduce((a, b) => (Math.abs(b - lvl) < Math.abs(a - lvl) ? b : a));
    const t = g.f(R(seed), L);
    t.gen = genId; t.lvl = L; t.seed = seed; t.topic = g.topic;
    return t;
  }

  // Probearbeit wie der Buch-Test S. 37 (Runde 1 und 2)
  function probearbeit(seed) {
    const r = R(seed), s = () => r.int(1, 2 ** 31 - 1);
    const A = [
      ["Zahlenstrahl", [["strahl.lesen", 2], ["strahl.lesen", 2]]],
      ["Zahlwörter und Runden", [["stellen.wort", 3], ["runden.auf", 2], ["runden.grenzen", 2]]],
      ["Kopfrechnen", [["kopf.addsub", 2], ["kopf.addsub", 2], ["kopf.mul", 2], ["kopf.mul", 3], ["kopf.div", 2], ["kopf.div", 1]]],
      ["Schriftlich rechnen", [["schrift.add", 2], ["schrift.sub", 2], ["schrift.mul", 2], ["schrift.div", 2]]],
      ["Ergänze die fehlende Zahl", [["platz.finden", 2], ["platz.finden", 2], ["platz.finden", 3]]],
      ["Größer, kleiner und ordnen", [["ordnen.vergleich", 2], ["ordnen.zwischen", 2]]],
      ["Sachaufgaben", [["sach.text", 2], ["div.sach", 2]]],
      ["Römische Zahlen und Zweiersystem", [["roem.zudez", 2], ["roem.zurom", 2], ["zwei.zudez", 2], ["zwei.zubin", 2]]],
      ["Diagramme", [["dia.lesen", 2], ["dia.einteilung", 2]]],
      ["Fachbegriffe", [["begriffe.satz", 2], ["begriffe.name", 1]]],
    ];
    return A.map(([title, parts], i) => ({ nr: i + 1, title, tasks: parts.map(([g, l]) => make(g, l, s())) }));
  }

  // Note wie in der Schule (Schätzung). key: Mindestprozent für 1, 2, 3, 4, 5
  function note(pct, key) {
    key = key || [92, 80, 65, 50, 25];
    let n = 6;
    for (let i = 0; i < 5; i++) if (pct >= key[i]) { n = i + 1; break; }
    if (n === 6) return { n, txt: "6" };
    const top = n === 1 ? 100 : key[n - 2], bot = key[n - 1], w = top - bot, pos = (pct - bot) / w;
    let tend = "";
    if (pos >= 0.75 && n > 1) tend = "+";
    else if (pos < 0.25) tend = "−";
    return { n, txt: n + tend };
  }

  const api = { G, TOPICS, make, probearbeit, note, fmt, parseNum, zahlwort, wortZuZahl, toRoman, fromRoman, romanValid, toBin, parseBin, roundTo, ueOk, ueBeispiel, svgLine, svgBars, divSteps, mulRows, R };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Aufgaben = api;
})(typeof self !== "undefined" ? self : this);
