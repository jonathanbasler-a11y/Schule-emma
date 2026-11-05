// Capy & Mathe – Oberfläche: Start, Thema üben, Fehlerkiste, Probearbeit, Album, Einstellungen.
(function () {
  "use strict";
  const A = window.Aufgaben, C = window.Capy;
  const TEST = window.__EMMA_TEST || {};
  const KEY = "capy-mathe-v1";
  const ROUND = TEST.roundLen || 8;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const app = $("#app");
  const rndSeed = () => (TEST.seedBase ? TEST.seedBase++ : Math.floor(Math.random() * 2147483646) + 1);

  // ---------- Spielstand ----------
  function fresh() {
    return {
      v: 1, xp: 0, gens: {}, box: [], exams: [], exam: null, stickers: [], wear: [], scene: "onsen",
      days: {}, streak: 0, lastDay: "", music: { on: false, vol: 0.5 }, sound: true, flags: {},
      set: { date: "2026-11-09", examMin: 45, key: [92, 80, 65, 50, 25], theme: "auto" }, stats: { tasks: 0, ok: 0, help: 0 },
    };
  }
  function load() {
    const f = fresh();
    let s;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { s = null; }
    if (!s || typeof s !== "object") return f;
    const o = Object.assign(f, s);
    o.set = Object.assign(fresh().set, s.set && typeof s.set === "object" ? s.set : {});
    o.music = Object.assign(fresh().music, s.music && typeof s.music === "object" ? s.music : {});
    o.stats = Object.assign(fresh().stats, s.stats && typeof s.stats === "object" ? s.stats : {});
    for (const k of ["box", "exams", "stickers", "wear"]) if (!Array.isArray(o[k])) o[k] = fresh()[k];
    for (const k of ["gens", "days", "flags"]) if (!o[k] || typeof o[k] !== "object" || Array.isArray(o[k])) o[k] = {};
    if (!Array.isArray(o.set.key) || o.set.key.length !== 5 || o.set.key.some((x) => typeof x !== "number")) o.set.key = fresh().set.key;
    o.box = o.box.filter((b) => b && A.G[b.gen]);
    if (o.exam && (!o.exam.seed || !o.exam.start)) o.exam = null;
    if (typeof o.xp !== "number" || !isFinite(o.xp)) o.xp = 0;
    // Mochi trägt die Mandarine nicht mehr von selbst
    if (!o.flags.ohneYuzu) { o.wear = o.wear.filter((w) => w !== "yuzu"); o.flags.ohneYuzu = true; }
    return o;
  }
  let S = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* voll oder privat */ } };

  const dayKey = (d) => { d = d || new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  function markDay() {
    const k = dayKey();
    if (S.lastDay === k) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    S.streak = S.lastDay === dayKey(y) ? S.streak + 1 : 1;
    S.lastDay = k;
    S.days[k] = (S.days[k] || 0);
  }
  function daysLeft() {
    const t = new Date(S.set.date + "T08:00:00");
    if (isNaN(t)) return null;
    const a = new Date(); a.setHours(0, 0, 0, 0); const b = new Date(t); b.setHours(0, 0, 0, 0);
    return Math.round((b - a) / 86400000);
  }

  // ---------- Fortschritt ----------
  const gs = (id) => S.gens[id] || (S.gens[id] = { lvl: A.G[id].lvls[0], st: 0, ok: 0, n: 0 });
  const genScore = (id) => { const g = S.gens[id]; if (!g) return 0; const lv = A.G[id].lvls; const pos = lv.indexOf(g.lvl); const span = lv.length - 1; return Math.min(1, ((pos < 0 ? 0 : pos) * 2 + Math.min(g.st, 2)) / (span * 2 + 2)); };
  const topicPct = (t) => Math.round((t.gens.reduce((a, id) => a + genScore(id), 0) / t.gens.length) * 100);
  const topicById = (id) => A.TOPICS.find((t) => t.id === id);

  // ---------- Sticker und Belohnungen ----------
  const STICKERS = [
    { id: "start", icon: "🌱", name: "Erste Aufgabe", t: () => S.stats.tasks >= 1 },
    { id: "ok10", icon: "🍂", name: "10 richtig", t: () => S.stats.ok >= 10 },
    { id: "ok50", icon: "🍁", name: "50 richtig", t: () => S.stats.ok >= 50 },
    { id: "ok150", icon: "🌰", name: "150 richtig", t: () => S.stats.ok >= 150 },
    { id: "hilfe", icon: "💡", name: "Mit Mochis Hilfe gelernt", t: () => S.stats.help >= 5 },
    { id: "probe1", icon: "📝", name: "Erste Probearbeit", t: () => S.exams.length >= 1 },
    { id: "note2", icon: "🏅", name: "Probearbeit: 2 oder besser", t: () => S.exams.some((e) => e.n <= 2) },
    { id: "note1", icon: "🏆", name: "Probearbeit: Note 1", t: () => S.exams.some((e) => e.n === 1) },
    { id: "kiste", icon: "📦", name: "Fehlerkiste geleert", t: () => !!S.flags.boxCleared },
    { id: "serie3", icon: "🔥", name: "3 Tage am Stück", t: () => S.streak >= 3 },
  ].concat(A.TOPICS.filter((t) => t.lern).map((t) => ({ id: "t_" + t.id, icon: t.icon, name: t.name + " – geschafft", t: () => topicPct(t) >= 75 })));
  function checkStickers() {
    const neu = [];
    for (const s of STICKERS) if (!S.stickers.includes(s.id) && s.t()) { S.stickers.push(s.id); neu.push(s); }
    const unlocked = [...C.OUTFITS.filter((o) => o.xp <= S.xp && o.xp > (S.flags.lastXpSeen || -1)), ...C.SCENES.filter((o) => o.xp <= S.xp && o.xp > (S.flags.lastXpSeen || -1))].filter((x) => x.xp > 0);
    S.flags.lastXpSeen = S.xp;
    neu.forEach((s, i) => setTimeout(() => toast(`${s.icon} Neuer Sticker: ${s.name}`), 300 + i * 3100));
    unlocked.forEach((u, i) => setTimeout(() => toast(`🎁 Freigeschaltet: ${u.name}`), 300 + (neu.length + i) * 3100));
  }
  function toast(msg) {
    const d = document.createElement("div"); d.className = "toast"; d.textContent = msg;
    document.body.appendChild(d); requestAnimationFrame(() => d.classList.add("in"));
    setTimeout(() => { d.classList.remove("in"); setTimeout(() => d.remove(), 400); }, 2600);
  }
  const sound = (k) => { if (S.sound) try { C.sfx[k](); } catch (e) { /* kein Ton */ } };

  // ---------- Theme ----------
  function applyTheme() {
    const h = new Date().getHours();
    const dark = S.set.theme === "dunkel" || (S.set.theme === "auto" && (h >= 19 || h < 7));
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }

  // ---------- Navigation ----------
  let view = { name: "home" };
  let P = null; // laufende Übungsrunde
  function go(name, extra) { view = Object.assign({ name }, extra || {}); render(); window.scrollTo(0, 0); }

  function topbar(title, back) {
    return `<header class="top">
      ${back ? `<button class="iconbtn" data-act="${back}" aria-label="Zurück">‹</button>` : `<div class="brand">${C.mochi("calm", [], 34)}<span>Capy &amp; Mathe</span></div>`}
      ${title ? `<h1>${title}</h1>` : ""}
      <div class="topr">
        <span class="chip" title="Tage am Stück">🔥 ${S.streak || 0}</span>
        <span class="chip" title="Blätter (Übungspunkte)">🍂 ${S.xp}</span>
        <button class="iconbtn music ${C.Lofi.on ? "on" : ""}" data-act="music" aria-label="Musik an oder aus">${C.Lofi.on ? "♫" : "♪"}</button>
      </div></header>`;
  }
  function ring(pct, size) {
    const r = 18, c = 2 * Math.PI * r;
    return `<svg class="ring" viewBox="0 0 44 44" width="${size || 44}" height="${size || 44}"><circle cx="22" cy="22" r="${r}" class="rbg"/>${pct > 0 ? `<circle cx="22" cy="22" r="${r}" class="rfg" stroke-dasharray="${(c * pct) / 100} ${c}" transform="rotate(-90 22 22)"/>` : ""}<text x="22" y="26.5">${pct}</text></svg>`;
  }

  // ---------- Start ----------
  function vHome() {
    const d = daysLeft();
    const cd = d == null ? "" : d > 1 ? `Noch <b>${d} Tage</b> bis zur Mathe-Arbeit` : d === 1 ? "<b>Morgen</b> ist die Mathe-Arbeit – du schaffst das!" : d === 0 ? "<b>Heute</b> ist die Mathe-Arbeit. Viel Glück! 🍀" : "Die Arbeit ist geschafft – üben hält dich fit.";
    const boxN = S.box.length;
    const running = S.exam ? `<button class="big-act exam running" data-act="examResume"><span class="ico">⏱️</span><span><b>Probearbeit fortsetzen</b><small>Du hast eine angefangene Probearbeit.</small></span></button>` : "";
    return topbar("") + `<main class="home">
      <section class="hero">${C.scene(S.scene)}
        <div class="heroin">${C.mochi(S.stats.tasks ? "calm" : "happy", S.wear, 150)}
          <div class="bubble"><b>${S.stats.tasks ? "Schön, dass du da bist!" : "Hallo, ich bin Mochi! 🍊"}</b><br>${esc(C.pick(C.MUT.concat(C.WITZ, C.FAKT)))}</div>
        </div>
        <div class="countdown">${cd}</div>
      </section>
      <section class="acts">
        ${running}
        <button class="big-act exam" data-act="examIntro"><span class="ico">📝</span><span><b>Probearbeit schreiben</b><small>${S.set.examMin} Minuten, mit Note – wie in der Schule</small></span></button>
        <button class="big-act box" data-act="box" ${boxN ? "" : "disabled"}><span class="ico">📦</span><span><b>Fehlerkiste${boxN ? ` (${boxN})` : ""}</b><small>${boxN ? "Deine Fehler nochmal üben" : "Noch leer – super!"}</small></span></button>
        <button class="big-act mix" data-act="mix"><span class="ico">🍵</span><span><b>Gemischte Runde</b><small>${ROUND} Aufgaben aus allen Themen</small></span></button>
      </section>
      <h2 class="sec">Themen vom Lernzettel</h2>
      <section class="topics">${A.TOPICS.map((t) => `<button class="tcard ${t.lern ? "" : "extra"}" data-act="topic" data-v="${t.id}"><span class="ticon">${t.icon}</span><span class="tname">${t.name}${t.lern ? "" : "<small>nicht auf dem Lernzettel</small>"}</span>${ring(topicPct(t))}</button>`).join("")}</section>
      <nav class="foot">
        <button data-act="album">🌟 Sticker-Album</button>
        <button data-act="cozy">🛋️ Orte &amp; Outfits</button>
        <button data-act="settings">⚙️ Einstellungen</button>
      </nav></main>`;
  }

  // ---------- Thema ----------
  const MERKE = {
    strahl: "Am Zahlenstrahl werden die Zahlen nach rechts größer. Erst klären: Wie viel ist ein Strich wert? Vorgänger = 1 weniger, Nachfolger = 1 mehr.",
    stellen: "Jede Stelle ist 10-mal so viel wert wie die rechts daneben. Dreierpäckchen: Milliarden | Millionen | Tausender | Hunderter-Zehner-Einer. Unter einer Million klein und zusammen schreiben.",
    runden: "Schau auf die Ziffer rechts von der Rundungsstelle: 0–4 abrunden, 5–9 aufrunden. Immer von der ursprünglichen Zahl aus runden. Zeichen: ≈",
    addsub: "Stellen genau untereinander schreiben, von rechts beginnen, Überträge nicht vergessen. Vorher Überschlag: glatte Zahlen, im Kopf rechnen.",
    mal: "1. Faktor · 2. Faktor = Produkt. Bei Nullen: ohne Nullen rechnen, dann alle Nullen anhängen. Schriftlich: Jede Zeile eine Stelle weiter rechts.",
    div: "Dividend : Divisor = Quotient. Durch 0 kann man nicht teilen. Probe: Quotient · Divisor + Rest = Dividend. Achtung: 0 im Ergebnis nicht vergessen (4635 : 15 = 309).",
    platz: "Für das Kästchen hilft die Umkehraufgabe: Aus + wird −, aus · wird : (und umgekehrt).",
    begriffe: "Summand + Summand = Summe · Minuend − Subtrahend = Differenz · Faktor · Faktor = Produkt · Dividend : Divisor = Quotient",
    sach: "1. Lesen und unterstreichen 2. Was ist gesucht? 3. Rechenausdruck 4. Rechnen 5. Antwortsatz. Bei Rest überlegen: auf- oder abrunden?",
    zwei: "Stellenwerte: 1, 2, 4, 8, 16, 32, 64 … (immer verdoppeln). Nur Ziffern 0 und 1. (11001)₂ = 16 + 8 + 1 = 25.",
    roem: "I=1 V=5 X=10 L=50 C=100 D=500 M=1000. Kleiner links vom Größeren wird abgezogen (IX=9). I, X, C höchstens 3-mal nebeneinander.",
    dia: "Erst die Einteilung der Achse ablesen (Wie viel ist ein Kästchen?). Beim Zeichnen: Die größte Säule muss draufpassen.",
    laengen: "1 km = 1000 m · 1 m = 10 dm · 1 dm = 10 cm · 1 cm = 10 mm",
  };
  const DOTS = ["○", "◐", "●"];
  function vTopic() {
    const t = topicById(view.topic);
    return topbar(t.icon + " " + t.name, "home") + `<main class="topic">
      <div class="merke"><b>Merke</b> ${esc(MERKE[t.id] || "")}</div>
      <button class="big-act mix" data-act="startTopic" data-v="${t.id}"><span class="ico">${t.icon}</span><span><b>Alles gemischt üben</b><small>${ROUND} Aufgaben, werden mit dir schwerer</small></span></button>
      <h2 class="sec">Einzeln üben</h2>
      <ul class="skills">${t.gens.map((id) => { const g = S.gens[id], p = Math.round(genScore(id) * 100); const lv = g ? A.G[id].lvls.indexOf(g.lvl) : 0; return `<li><button data-act="startGen" data-v="${id}"><span class="sname">${A.G[id].name}</span><span class="slvl" title="Stufe">${A.G[id].lvls.map((_, i) => `<i class="${i <= lv && g ? "on" : ""}">${DOTS[Math.min(i, 2)]}</i>`).join("")}</span><span class="bar"><i style="width:${p}%"></i></span></button></li>`; }).join("")}</ul></main>`;
  }

  // ---------- Übungsrunde ----------
  function startPractice(mode, opt) {
    P = { mode, topic: opt && opt.topic, gen: opt && opt.gen, i: 0, res: [], xp: 0, cur: null, recent: [] };
    if (mode === "box") P.queue = S.box.slice().sort((a, b) => (a.t || 0) - (b.t || 0)).slice(0, ROUND).map((b) => b.gen);
    P.total = mode === "box" ? P.queue.length : ROUND;
    nextTask();
    go("practice");
  }
  function pickGen() {
    if (P.mode === "gen") return P.gen;
    if (P.mode === "box") return P.queue[P.i];
    let pool;
    if (P.mode === "topic") pool = topicById(P.topic).gens;
    else pool = A.TOPICS.filter((t) => t.lern).flatMap((t) => t.gens);
    // schwächere Bereiche öfter, gerade Geübtes seltener
    const w = pool.map((id) => (P.recent.includes(id) ? 0.15 : 1) * (1.4 - genScore(id)));
    let r = Math.random() * w.reduce((a, b) => a + b, 0), i = 0;
    for (; i < pool.length - 1; i++) { r -= w[i]; if (r <= 0) break; }
    return pool[i];
  }
  function nextTask() {
    const id = TEST.forceGen && P.mode !== "box" ? TEST.forceGen : pickGen();
    let lvl = gs(id).lvl, seed = rndSeed();
    if (P.mode === "box") { const b = S.box.find((x) => x.gen === id); if (b) { lvl = b.lvl; if (!b.tried) { seed = b.seed; b.tried = true; } } }
    P.recent = [id].concat(P.recent).slice(0, 3);
    P.cur = { t: A.make(id, lvl, seed), tries: 0, help: 0, done: false };
  }
  function addToBox(t) {
    let b = S.box.find((x) => x.gen === t.gen);
    if (!b) { b = { gen: t.gen, lvl: t.lvl, seed: t.seed, st: 0, n: 0, t: Date.now() }; S.box.push(b); }
    b.st = 0; b.n++; b.lvl = t.lvl; b.seed = t.seed; b.tried = false;
  }
  function boxSolved(t) {
    const b = S.box.find((x) => x.gen === t.gen);
    if (!b) return false;
    b.st++;
    if (b.st >= 2) { S.box = S.box.filter((x) => x !== b); if (!S.box.length) S.flags.boxCleared = true; return true; }
    return false;
  }

  function vPractice() {
    const c = P.cur, t = c.t, top = topicById(t.topic);
    const dots = Array.from({ length: P.total }, (_, i) => `<i class="${i < P.res.length ? (P.res[i] ? "ok" : "bad") : i === P.i ? "now" : ""}"></i>`).join("");
    const mood = c.done ? (c.ok ? "happy" : "think") : c.help ? "think" : "calm";
    const say = c.say || (P.mode === "box" ? "Die hier war beim letzten Mal knifflig. Ganz in Ruhe!" : t.kind === "written" ? "Mach zuerst einen Überschlag – das hilft beim Kontrollieren." : "Du schaffst das. Ich bin da, wenn du Hilfe brauchst.");
    return topbar(P.mode === "box" ? "📦 Fehlerkiste" : top.icon + " " + top.name, "quit") + `<main class="practice">
      <div class="progress">${dots}</div>
      <div class="pgrid">
        <aside class="side">${C.mochi(mood, S.wear, 120)}<div class="bubble small">${say}</div></aside>
        <article class="card task" data-k="p">
          <div class="tmeta">${A.G[t.gen].name} <span class="lvl">${DOTS[Math.min(A.G[t.gen].lvls.indexOf(t.lvl), 2)]}</span></div>
          <div class="q">${t.q}</div>
          ${renderInput(t, "p")}
          <div class="hints">${t.hints.slice(0, Math.min(c.help, t.hints.length)).map((h, i) => `<div class="hint"><b>Tipp ${i + 1}</b> ${h}</div>`).join("")}${c.help > t.hints.length ? `<div class="hint sol"><b>So geht's</b> ${t.solution}</div>` : ""}</div>
          ${c.done ? feedback(c) : `<div class="btns"><button class="btn soft" data-act="help">💡 ${c.help === 0 ? "Mochi, hilf mir" : c.help <= t.hints.length - 1 ? "Noch ein Tipp" : c.help === t.hints.length ? "Zeig mir den Weg" : "Weg gezeigt"}</button><button class="btn main" data-act="check">Prüfen ✓</button></div>`}
          ${c.msg && !c.done ? `<div class="fb warn">${c.msg}</div>` : ""}
        </article>
      </div></main>`;
  }
  function feedback(c) {
    const t = c.t;
    return `<div class="fb ${c.ok ? "ok" : "bad"}">
      <div class="fbh">${c.ok ? "✓ " + esc(c.lob) : "✗ " + esc(c.trost)}</div>
      ${c.note ? `<div class="note">${esc(c.note)}</div>` : ""}
      ${!c.ok ? `<div class="right">Richtig ist: <b>${esc(t.answer)}</b></div>` : ""}
      ${c.help > t.hints.length ? "" : c.ok ? `<details><summary>So geht's</summary>${t.solution}</details>` : `<div class="solbox">${t.solution}</div>`}
      <div class="btns"><button class="btn main" data-act="next" autofocus>${P.i + 1 >= P.total ? "Fertig 🎉" : "Weiter →"}</button></div></div>`;
  }
  function doCheck() {
    const c = P.cur, t = c.t, el = $(".task");
    const inp = readInput(t, el);
    if (isEmpty(t, inp)) { c.msg = "Trag zuerst eine Antwort ein. 🙂"; render(); return; }
    const r = t.check(inp);
    c.input = inp;
    markCells(t, el, r);
    if (r.ok) {
      c.done = true; c.ok = true; c.note = r.note || ""; c.lob = C.pick(C.LOB);
      const clean = c.tries === 0 && c.help === 0;
      finish(c, clean);
      sound("ok");
    } else {
      c.tries++;
      const binary = (t.kind === "choice" || t.kind === "cmp") && t.options.length <= 3;
      if (c.tries === 1 && !binary) {
        c.msg = "Noch nicht ganz – schau nochmal genau hin." + (c.help === 0 ? " Ein Tipp ist unten." : "");
        if (c.help === 0) c.help = 1;
        c.say = "Hmm, fast. Lies den Tipp und probier's nochmal.";
        sound("bad"); render(); restoreInput(t, inp); markCells(t, $(".task"), r); return;
      }
      c.done = true; c.ok = false; c.trost = C.pick(C.TROST); c.note = r.note || "";
      finish(c, false);
      sound("bad");
    }
    render();
    restoreInput(t, inp); markCells(t, $(".task"), r); lockInputs($(".task"));
  }
  function finish(c, clean) {
    const t = c.t, g = gs(t.gen);
    markDay();
    S.stats.tasks++; g.n++;
    S.days[dayKey()] = (S.days[dayKey()] || 0) + 1;
    const lv = A.G[t.gen].lvls;
    if (c.ok) S.stats.ok++;
    if (c.ok && clean) {
      g.ok++; g.st++;
      if (g.st >= 2 && lv.indexOf(g.lvl) < lv.length - 1) { g.lvl = lv[lv.indexOf(g.lvl) + 1]; g.st = 0; c.say = "Stark! Ab jetzt wird es ein bisschen kniffliger. ✨"; }
      P.xp += 10; S.xp += 10;
      if (P.mode === "box") { if (boxSolved(t)) c.say = "Die ist raus aus der Fehlerkiste! 🎉"; else c.say = "Richtig! Noch einmal, dann ist sie raus aus der Kiste."; }
    } else {
      g.st = 0;
      if (!c.ok && lv.indexOf(g.lvl) > 0) g.lvl = lv[lv.indexOf(g.lvl) - 1];
      addToBox(t);
      if (c.ok) { P.xp += 4; S.xp += 4; c.say = "Mit Hilfe geschafft! Wir üben sie später nochmal."; }
      else c.say = "Die kommt in deine Fehlerkiste. Dort üben wir sie nochmal.";
    }
    if (c.help) S.stats.help++;
    P.res.push(c.ok && clean);
    save(); checkStickers();
  }
  function vRoundEnd() {
    const ok = P.res.filter(Boolean).length, n = P.res.length;
    const mood = ok / n >= 0.75 ? "proud" : ok / n >= 0.5 ? "happy" : "calm";
    return topbar("Runde geschafft", "home") + `<main class="end">
      <div class="card center">${C.mochi(mood, S.wear, 170)}
        <h2>${ok} von ${n} auf Anhieb richtig</h2>
        <p class="xp">+${P.xp} 🍂</p>
        <p>${ok === n ? "Wow, alles richtig! Mochi springt vor Freude ins Wasser." : ok / n >= 0.5 ? "Gut gemacht! Die Fehler wandern in die Fehlerkiste – da üben wir sie nochmal." : "Das war eine knifflige Runde. Schau dir die Fehlerkiste an – so lernst du am meisten."}</p>
        <p class="quote">„${esc(C.pick(C.MUT))}“</p>
        <div class="btns"><button class="btn soft" data-act="home">Zur Übersicht</button>${S.box.length ? `<button class="btn soft" data-act="box">📦 Fehlerkiste (${S.box.length})</button>` : ""}<button class="btn main" data-act="again">Noch eine Runde</button></div>
      </div></main>`;
  }

  // ---------- Eingaben ----------
  function cellIn(f, cls, extra) { return `<input class="cell ${cls || ""}" data-f="${f}" inputmode="numeric" maxlength="1" autocomplete="off" ${extra || ""}>`; }
  function renderInput(t, k) {
    const num = (f, ph, cls) => `<input class="inp ${cls || ""}" data-f="${f}" inputmode="numeric" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="${ph || ""}">`;
    switch (t.kind) {
      case "num":
        if (t.withRest) return `<div class="ans">${num("q", "Ergebnis")} <span class="lbl">Rest</span> ${num("r", "0", "short")}</div>`;
        return `<div class="ans">${num("v", "Antwort")}${t.unit ? `<span class="unit">${esc(t.unit)}</span>` : ""}</div>`;
      case "text":
        return `<div class="ans"><input class="inp wide ${t.upper ? "upper" : ""}" data-f="v" ${t.inputmode ? `inputmode="${t.inputmode}"` : ""} autocomplete="off" autocapitalize="${t.upper ? "characters" : "off"}" autocorrect="off" spellcheck="false" placeholder="Antwort"></div>`;
      case "choice": case "cmp":
        return `<div class="opts ${t.kind}">${t.options.map((o, i) => `<button class="opt" data-act="opt" data-i="${i}">${esc(o)}</button>`).join("")}</div>`;
      case "cells": {
        const small = t.cells.every((c) => c.ans.length === 1);
        return `<table class="cellt ${small ? "small" : ""}"><tr>${t.cells.map((c) => `<th>${esc(c.label)}</th>`).join("")}</tr><tr class="cellrow">${t.cells.map((c, i) => `<td>${small ? cellIn("c" + i, "", 'data-adv="r"') : num("c" + i, "", "mid")}</td>`).join("")}</tr></table>`;
      }
      case "holes":
        return `<div class="wgrid holes">${t.grid.map((row, ri) => `<div class="wrow ${ri === t.grid.length - 1 ? "res" : ""}"><span class="wc sign">${ri === 1 ? "+" : ""}</span>${row.map((c) => `<span class="wc">${c.hole != null ? cellIn("c" + c.hole) : c.ch === " " ? "" : c.ch}</span>`).join("")}</div>${ri === 1 ? '<div class="wline"></div>' : ""}`).join("")}</div>`;
      case "mauer":
        return `<div class="mauer">${t.shape.map((row) => `<div class="mrow">${row.map((c) => `<span>${c.hole != null ? num("c" + c.hole, "", "brick") : A.fmt(c.v)}</span>`).join("")}</div>`).join("")}</div>`;
      case "kette":
        return `<div class="kette"><span class="kbox fixed">${A.fmt(t.start)}</span>${t.ops.map((o, i) => `<span class="karrow">${{ "+": "+", "-": "−", "*": "·", "/": ":" }[o.op]} ${A.fmt(o.n)} →</span><span class="kbox">${num("c" + i, "", "mid")}</span>`).join("")}</div>`;
      case "place":
        return `<div class="placewrap" data-sel="">${A.svgLine(Object.assign({ place: true }, t.line))}<div class="placehint">Tippe auf einen Strich.</div></div>`;
      case "order":
        return `<div class="orderwrap" data-seq="[]"><div class="seq"><span class="ph">Tippe die kleinste Zahl zuerst …</span></div><div class="chips">${t.items.map((v) => `<button class="chipn" data-act="ord" data-v="${v}">${A.fmt(v)}</button>`).join("")}</div><button class="btn tiny" data-act="ordReset">↺ von vorn</button></div>`;
      case "written": return renderWritten(t);
    }
    return "";
  }
  function renderWritten(t) {
    const ue = `<label class="ue">Überschlag: <input class="inp wide" data-f="ue" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="z. B. 2000 + 300 = 2300"></label>`;
    if (t.op === "/") {
      const a = String(t.nums[0]), W = a.length + 1, rows = Math.min(6, a.length + 2);
      return ue + `<div class="wgrid div"><div class="wrow head">${a.split("").map((d) => `<span class="wc">${d}</span>`).join("")}<span class="wc">:</span>${String(t.nums[1]).split("").map((d) => `<span class="wc">${d}</span>`).join("")}<span class="wc">=</span><input class="inp quot" data-f="res" inputmode="numeric" autocomplete="off" placeholder="Ergebnis"><span class="lbl">Rest</span><input class="inp short" data-f="rest" inputmode="numeric" autocomplete="off" placeholder="0"></div>
        <div class="scratch">${Array.from({ length: rows }, () => `<div class="wrow">${Array.from({ length: W }, () => `<span class="wc">${cellIn("x", "scr", 'data-adv="r"')}</span>`).join("")}</div>`).join("")}</div>
        </div><div class="gridnote">Die Kästchen sind dein Schmierblatt – geprüft wird das Ergebnis oben.</div>`;
    }
    if (t.op === "*") {
      const head = `${t.nums[0]}·${t.nums[1]}`, W = head.length;
      return ue + `<div class="wgrid mul"><div class="wrow head"><span class="wc sign"></span>${head.split("").map((d) => `<span class="wc">${d === "·" ? "·" : d}</span>`).join("")}</div>
        ${String(t.nums[1]).split("").map((_, i) => `<div class="wrow"><span class="wc sign">${i ? "+" : ""}</span>${Array.from({ length: W }, () => `<span class="wc">${cellIn("x", "scr", 'data-adv="l"')}</span>`).join("")}</div>`).join("")}
        <div class="wrow carry"><span class="wc sign"></span>${Array.from({ length: W }, () => `<span class="wc">${cellIn("x", "car", 'data-adv="l"')}</span>`).join("")}</div>
        <div class="wline"></div>
        <div class="wrow res"><span class="wc sign"></span>${Array.from({ length: W }, (_, i) => `<span class="wc">${cellIn("r" + i, "", 'data-adv="l"')}</span>`).join("")}</div>
        </div><div class="gridnote">Teilergebnisse und Überträge sind dein Schmierblatt – geprüft wird die unterste Zeile.</div>`;
    }
    const W = Math.max(...t.nums.map((n) => String(n).length), String(t.res).length) + 1;
    const sym = t.op === "+" ? "+" : "−";
    return ue + `<div class="wgrid">${t.nums.map((n, i) => `<div class="wrow"><span class="wc sign">${i ? sym : ""}</span>${String(n).padStart(W, " ").split("").map((d) => `<span class="wc">${d === " " ? "" : d}</span>`).join("")}</div>`).join("")}
      <div class="wrow carry"><span class="wc sign"></span>${Array.from({ length: W }, () => `<span class="wc">${cellIn("x", "car", 'data-adv="l"')}</span>`).join("")}</div>
      <div class="wline"></div>
      <div class="wrow res"><span class="wc sign"></span>${Array.from({ length: W }, (_, i) => `<span class="wc">${cellIn("r" + i, "", 'data-adv="l"')}</span>`).join("")}</div>
      </div><div class="gridnote">Kleine Kästchen: Platz für Überträge. Schreib das Ergebnis von rechts nach links.</div>`;
  }
  function readInput(t, el) {
    const f = (n) => { const x = el.querySelector(`[data-f="${n}"]`); return x ? x.value.trim() : ""; };
    switch (t.kind) {
      case "num": return t.withRest ? { q: f("q"), r: f("r") } : f("v");
      case "text": return f("v");
      case "choice": case "cmp": { const s = el.querySelector(".opt.sel"); return s ? Number(s.dataset.i) : null; }
      case "cells": case "holes": case "mauer": case "kette": return t.cells.map((_, i) => f("c" + i));
      case "place": { const w = el.querySelector(".placewrap"); return w && w.dataset.sel !== "" ? Number(w.dataset.sel) : null; }
      case "order": { const w = el.querySelector(".orderwrap"); return w ? JSON.parse(w.dataset.seq) : []; }
      case "written": {
        if (t.op === "/") return { res: f("res"), rest: f("rest"), ue: f("ue") };
        const cells = [...el.querySelectorAll('.wrow.res [data-f^="r"]')].map((x) => x.value.trim());
        return { res: cells.join(""), ue: f("ue"), raw: cells };
      }
    }
    return null;
  }
  function isEmpty(t, v) {
    if (v == null) return true;
    if (typeof v === "string") return v === "";
    if (Array.isArray(v)) return t.kind === "order" ? v.length < t.items.length : v.every((x) => x === "");
    if (t.kind === "num") return v.q === "";
    if (t.kind === "written") return v.res === "";
    return false;
  }
  function restoreInput(t, v, el) {
    el = el || $(".task");
    if (!el || v == null) return;
    const set = (n, val) => { const x = el.querySelector(`[data-f="${n}"]`); if (x) x.value = val == null ? "" : val; };
    switch (t.kind) {
      case "num": if (t.withRest) { set("q", v.q); set("r", v.r); } else set("v", v); break;
      case "text": set("v", v); break;
      case "choice": case "cmp": { const b = el.querySelector(`.opt[data-i="${v}"]`); if (b) b.classList.add("sel"); break; }
      case "cells": case "holes": case "mauer": case "kette": v.forEach((x, i) => set("c" + i, x)); break;
      case "place": placeSel(el.querySelector(".placewrap"), v); break;
      case "order": { const w = el.querySelector(".orderwrap"); if (w) { w.dataset.seq = JSON.stringify(v); drawSeq(w); } break; }
      case "written":
        set("ue", v.ue);
        if (t.op === "/") { set("res", v.res); set("rest", v.rest); }
        else if (v.raw) { const cells = [...el.querySelectorAll('.wrow.res [data-f^="r"]')]; v.raw.forEach((x, i) => { if (cells[i]) cells[i].value = x; }); }
        break;
    }
  }
  function markCells(t, el, r) {
    if (!el || !r) return;
    if (r.cells) t.cells.forEach((_, i) => { const x = el.querySelector(`[data-f="c${i}"]`); if (x) x.classList.toggle("bad", !r.cells[i]), x.classList.toggle("good", !!r.cells[i]); });
  }
  function lockInputs(el) { if (el) $$("input", el).forEach((x) => (x.readOnly = true)); if (el) $$(".opt, .chipn, .hit, [data-act=ordReset]", el).forEach((x) => x.setAttribute("data-locked", "1")); }
  function placeSel(w, v) {
    if (!w || v == null) return;
    w.dataset.sel = v;
    const svg = w.querySelector("svg"), hit = svg.querySelector(`.hit[data-v="${v}"]`);
    $$(".pin", svg).forEach((p) => p.remove());
    if (!hit) return;
    const x = Number(hit.getAttribute("x")) + Number(hit.getAttribute("width")) / 2;
    svg.insertAdjacentHTML("beforeend", `<g class="pin"><circle cx="${x}" cy="60" r="7"/><path d="M${x} 22 L${x} 50" /></g>`);
    w.querySelector(".placehint").textContent = "Gewählt. Tippe woanders hin, um es zu ändern.";
  }
  function drawSeq(w) {
    const seq = JSON.parse(w.dataset.seq);
    w.querySelector(".seq").innerHTML = seq.length ? seq.map((v) => `<span class="chipn sel">${A.fmt(v)}</span>`).join('<span class="lt">&lt;</span>') : '<span class="ph">Tippe die kleinste Zahl zuerst …</span>';
    $$(".chips .chipn", w).forEach((b) => b.classList.toggle("used", seq.includes(Number(b.dataset.v))));
  }

  // ---------- Probearbeit ----------
  function vExamIntro() {
    return topbar("📝 Probearbeit", "home") + `<main class="exami"><div class="card">
      <div class="row">${C.mochi("calm", S.wear.concat(["brille"]).filter((v, i, a) => a.indexOf(v) === i), 130)}<div>
      <h2>Wie eine echte Klassenarbeit</h2>
      <ul class="plain"><li>⏱️ <b>${S.set.examMin} Minuten</b> Zeit. Die Uhr läuft weiter, auch wenn du die App kurz verlässt.</li>
      <li>📄 10 Aufgaben wie im Buch-Test auf Seite 37: Zahlenstrahl, Zahlwörter, Runden, Kopfrechnen, schriftlich rechnen, Platzhalter, Sachaufgaben, römische Zahlen, Zweiersystem, Diagramme, Fachbegriffe.</li>
      <li>🤫 Keine Hilfe und kein „richtig/falsch“ während der Arbeit – erst am Ende.</li>
      <li>📝 Beim schriftlichen Rechnen gibt es auch einen Punkt für den Überschlag.</li>
      <li>🎓 Am Ende bekommst du Punkte und eine Note – so ungefähr wie in der Schule.</li></ul></div></div>
      <div class="btns"><button class="btn soft" data-act="home">Noch nicht</button><button class="btn main" data-act="examStart">Los geht's!</button></div>
      <p class="small">Tipp: Leg dir Papier und Stift für Nebenrechnungen hin – wie in der Schule.</p></div></main>`;
  }
  let EX = null; // { seed, parts, start, dur }
  function examFromState() {
    if (!S.exam) return null;
    const parts = A.probearbeit(S.exam.seed);
    return { seed: S.exam.seed, parts, start: S.exam.start, dur: S.exam.dur, answers: S.exam.answers || {} };
  }
  function startExam() {
    const seed = rndSeed();
    S.exam = { seed, start: Date.now(), dur: TEST.examMs || S.set.examMin * 60000, answers: {} };
    save();
    EX = examFromState();
    go("exam");
  }
  const remain = () => Math.max(0, EX.start + EX.dur - Date.now());
  const letters = "abcdefghijklmnop";
  function vExam() {
    const pts = EX.parts.reduce((a, p) => a + p.tasks.reduce((b, t) => b + t.pts, 0), 0);
    return `<header class="top exam"><button class="iconbtn" data-act="examPause" aria-label="Pause">‖</button><h1>Probearbeit · ${pts} Punkte</h1><div class="timer" id="timer">${timerTxt()}</div></header>
      <main class="exam"><nav class="jump">${EX.parts.map((p) => `<a href="#a${p.nr}">${p.nr}</a>`).join("")}</nav>
      ${EX.parts.map((p, ai) => `<section class="apart" id="a${p.nr}"><h2>Aufgabe ${p.nr}: ${p.title} <small>(${p.tasks.reduce((b, t) => b + t.pts, 0)} P.)</small></h2>
        ${p.tasks.map((t, ti) => `<div class="card task etask" data-k="${ai}.${ti}"><div class="q"><b>${letters[ti]})</b> ${t.q}<span class="pts">${t.pts} P.</span></div>${renderInput(t, ai + "." + ti)}</div>`).join("")}</section>`).join("")}
      <div class="card center"><p>Fertig? Schau alles nochmal durch. Dann gib ab.</p><button class="btn main" data-act="examSubmit">Abgeben ✓</button></div></main>`;
  }
  function timerTxt() {
    const ms = remain(), m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    return ms > 60000 ? `noch ${m + (s > 0 ? 1 : 0)} Min.` : `noch ${s} Sek.`;
  }
  let tick = null;
  function examTick() {
    clearInterval(tick);
    tick = setInterval(() => {
      if (view.name !== "exam" || !EX) { clearInterval(tick); return; }
      const el = $("#timer"); if (el) { el.textContent = timerTxt(); el.classList.toggle("low", remain() < 5 * 60000); }
      if (remain() <= 0) { clearInterval(tick); toast("⏰ Die Zeit ist um!"); submitExam(); }
    }, TEST.examMs ? 100 : 1000);
  }
  function examSaveAnswers() {
    if (!EX || !S.exam) return;
    $$(".etask").forEach((el) => { const [ai, ti] = el.dataset.k.split(".").map(Number); const t = EX.parts[ai].tasks[ti]; S.exam.answers[el.dataset.k] = readInput(t, el); });
    save();
  }
  function examRestore() {
    $$(".etask").forEach((el) => { const v = S.exam.answers[el.dataset.k]; if (v != null) { const [ai, ti] = el.dataset.k.split(".").map(Number); restoreInput(EX.parts[ai].tasks[ti], v, el); } });
  }
  function scoreTask(t, v) {
    if (v == null || isEmpty(t, v)) return { p: 0, ok: false };
    let r; try { r = t.check(v); } catch (e) { r = { ok: false }; }
    if (t.kind === "written") { const p = (r.ok ? 2 : 0) + (r.ue ? 1 : 0); return { p, ok: r.ok, ue: r.ue }; }
    if (r.cells && !r.ok) { const p = Math.floor((t.pts * r.cells.filter(Boolean).length / r.cells.length) * 2) / 2; return { p, ok: false, cells: r.cells }; }
    return { p: r.ok ? t.pts : 0, ok: r.ok };
  }
  function submitExam() {
    examSaveAnswers();
    clearInterval(tick);
    let got = 0, max = 0;
    const per = [], wrong = [], byTopic = {};
    EX.parts.forEach((p, ai) => {
      let pg = 0, pm = 0;
      p.tasks.forEach((t, ti) => {
        const v = S.exam.answers[ai + "." + ti];
        const s = scoreTask(t, v);
        pg += s.p; pm += t.pts;
        const bt = byTopic[t.topic] || (byTopic[t.topic] = [0, 0]); bt[0] += s.p; bt[1] += t.pts;
        if (!s.ok || s.p < t.pts) wrong.push({ ai, ti, v, s });
        if (!s.ok) addToBox(t);
      });
      got += pg; max += pm; per.push([pg, pm]);
    });
    const pct = Math.round((got / max) * 1000) / 10;
    const n = A.note(pct, S.set.key);
    const ex = { d: Date.now(), seed: EX.seed, got, max, pct, n: n.n, txt: n.txt, per, byTopic, wrong: wrong.map((w) => [w.ai, w.ti]), answers: S.exam.answers };
    S.exams.push(ex);
    S.xp += Math.round(got * 3);
    markDay();
    S.exam = null; save();
    checkStickers();
    view = { name: "examResult", idx: S.exams.length - 1 };
    sound(n.n <= 2 ? "win" : "ok");
    render(); window.scrollTo(0, 0);
  }
  function showAnswer(t, v) {
    if (v == null || isEmpty(t, v)) return "–";
    switch (t.kind) {
      case "choice": case "cmp": return esc(t.options[v]);
      case "num": return t.withRest ? esc(v.q + (v.r ? " Rest " + v.r : "")) : esc(v);
      case "text": return esc(v);
      case "place": return esc(A.fmt(v));
      case "order": return v.map(A.fmt).join(" < ");
      case "written": return esc(v.res + (v.rest ? " Rest " + v.rest : "")) + (v.ue ? ` <small>(Überschlag: ${esc(v.ue)})</small>` : ` <small>(kein Überschlag)</small>`);
      default: return esc(v.join(" | "));
    }
  }
  function vExamResult() {
    const ex = S.exams[view.idx];
    const parts = A.probearbeit(ex.seed);
    const mood = ex.n <= 2 ? "proud" : ex.n <= 3 ? "happy" : "calm";
    const msg = ex.n <= 1 ? "Ausgezeichnet! Damit kannst du ganz entspannt in die Arbeit gehen." : ex.n <= 2 ? "Richtig gut! Schau dir die paar Fehler an – dann sitzt alles." : ex.n <= 3 ? "Ordentlich! Mit der Fehlerkiste holst du noch einiges raus." : "Das ist noch nicht die Note, die du willst – aber genau dafür üben wir. Fang mit der Fehlerkiste an.";
    const topicRows = Object.entries(ex.byTopic).map(([k, [g, m]]) => [topicById(k), g, m]).sort((a, b) => a[1] / a[2] - b[1] / b[2]);
    return topbar("Auswertung", "home") + `<main class="result">
      <div class="card center grade">${C.mochi(mood, S.wear, 140)}
        <div class="note-big"><small>Note (Schätzung)</small><b>${esc(ex.txt)}</b></div>
        <div class="ptsbig">${fmtP(ex.got)} von ${ex.max} Punkten · ${String(ex.pct).replace(".", ",")} %</div>
        <p>${msg}</p>
        <p class="small">Die Note ist eine Schätzung mit einem üblichen Notenschlüssel (1 ab ${S.set.key[0]} %, 2 ab ${S.set.key[1]} %, 3 ab ${S.set.key[2]} %, 4 ab ${S.set.key[3]} %, 5 ab ${S.set.key[4]} %). Deine Lehrerin kann etwas anders bewerten.</p>
        <div class="btns">${S.box.length ? `<button class="btn main" data-act="box">📦 Fehler jetzt üben (${S.box.length})</button>` : ""}<button class="btn soft" data-act="home">Zur Übersicht</button></div>
      </div>
      <h2 class="sec">So lief es in den Themen</h2>
      <div class="card"><table class="tab wide">${topicRows.map(([t, g, m]) => `<tr><th>${t.icon} ${t.name}</th><td>${fmtP(g)} / ${m}</td><td class="barc"><span class="bar"><i style="width:${Math.round((g / m) * 100)}%"></i></span></td></tr>`).join("")}</table></div>
      <h2 class="sec">Aufgaben im Einzelnen</h2>
      ${parts.map((p, ai) => `<details class="card review" ${ex.per[ai][0] < ex.per[ai][1] ? "open" : ""}><summary><b>Aufgabe ${p.nr}: ${p.title}</b><span class="pp ${ex.per[ai][0] === ex.per[ai][1] ? "full" : ""}">${fmtP(ex.per[ai][0])} / ${ex.per[ai][1]} P.</span></summary>
        ${p.tasks.map((t, ti) => { const v = ex.answers[ai + "." + ti]; const s = scoreTask(t, v); return `<div class="rv ${s.ok ? "ok" : "bad"}"><div class="q"><b>${letters[ti]})</b> ${t.q}</div><div class="your">Deine Antwort: ${showAnswer(t, v)} <span class="pp">${fmtP(s.p)} / ${t.pts}</span></div>${s.ok && s.p === t.pts ? "" : `<div class="right">Richtig: <b>${esc(t.answer)}</b></div><details><summary>So geht's</summary>${t.solution}</details>`}</div>`; }).join("")}</details>`).join("")}
      </main>`;
  }
  const fmtP = (x) => String(x).replace(".", ",");

  // ---------- Album, Orte & Outfits ----------
  function vAlbum() {
    return topbar("🌟 Sticker-Album", "home") + `<main class="album"><p class="center">${S.stickers.length} von ${STICKERS.length} Stickern gesammelt</p>
      <div class="stickers">${STICKERS.map((s) => { const has = S.stickers.includes(s.id); return `<div class="sticker ${has ? "has" : ""}"><span class="sicon">${has ? s.icon : "?"}</span><span class="sname">${has ? s.name : esc(s.name)}</span></div>`; }).join("")}</div></main>`;
  }
  function vCozy() {
    return topbar("🛋️ Orte & Outfits", "home") + `<main class="cozy">
      <div class="card preview">${C.scene(S.scene)}<div class="heroin">${C.mochi("happy", S.wear, 140)}</div></div>
      <h2 class="sec">Gemütliche Orte</h2>
      <div class="grid3">${C.SCENES.map((s) => { const ok = S.xp >= s.xp; return `<button class="pick ${S.scene === s.id ? "sel" : ""}" data-act="${ok ? "scene" : "locked"}" data-v="${s.id}" ${ok ? "" : 'aria-disabled="true"'}><span class="mini">${C.scene(s.id)}</span><span>${s.name}</span>${ok ? "" : `<small>🔒 ab ${s.xp} 🍂</small>`}</button>`; }).join("")}</div>
      <h2 class="sec">Mochis Outfits</h2>
      <div class="grid3">${C.OUTFITS.map((o) => { const ok = S.xp >= o.xp; return `<button class="pick ${S.wear.includes(o.id) ? "sel" : ""}" data-act="${ok ? "wear" : "locked"}" data-v="${o.id}"><span class="mini m">${C.mochi("calm", [o.id], 80)}</span><span>${o.name}</span>${ok ? "" : `<small>🔒 ab ${o.xp} 🍂</small>`}</button>`; }).join("")}</div>
      <p class="small center">🍂 Blätter bekommst du für jede richtige Aufgabe und für Probearbeiten.</p></main>`;
  }

  // ---------- Einstellungen ----------
  function vSettings() {
    const k = S.set.key;
    return topbar("⚙️ Einstellungen", "home") + `<main class="settings">
      <div class="card"><h2>Für dich</h2>
        <label class="row2">Tag der Mathe-Arbeit <input type="date" data-set="date" value="${esc(S.set.date)}"></label>
        <label class="row2">Musik-Lautstärke <input type="range" min="0" max="1" step="0.05" data-set="vol" value="${S.music.vol}"></label>
        <label class="row2">Klänge bei richtig/falsch <input type="checkbox" data-set="sound" ${S.sound ? "checked" : ""}></label>
        <label class="row2">Farben <select data-set="theme">${[["auto", "automatisch (abends dunkel)"], ["hell", "hell"], ["dunkel", "dunkel"]].map(([v, n]) => `<option value="${v}" ${S.set.theme === v ? "selected" : ""}>${n}</option>`).join("")}</select></label>
      </div>
      <div class="card"><h2>Für Eltern</h2>
        <label class="row2">Dauer der Probearbeit <select data-set="examMin">${[30, 45, 60, 90].map((m) => `<option value="${m}" ${S.set.examMin === m ? "selected" : ""}>${m} Minuten</option>`).join("")}</select></label>
        <div class="row2">Notenschlüssel (Prozent ab …)<span class="keys">${[1, 2, 3, 4, 5].map((n, i) => `<label>${n}: <input type="number" min="0" max="100" data-key="${i}" value="${k[i]}"></label>`).join("")}</span></div>
        <p class="small">Übliche Grenzen am Gymnasium; jede Lehrkraft macht es etwas anders. Die Note in der App ist deshalb immer eine Schätzung.</p>
        <h3>Probearbeiten</h3>
        ${S.exams.length ? `<table class="tab wide"><tr><th>Datum</th><th>Punkte</th><th>Note</th><th></th></tr>${S.exams.map((e, i) => `<tr><td>${new Date(e.d).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric" })} ${new Date(e.d).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</td><td>${fmtP(e.got)} / ${e.max}</td><td><b>${esc(e.txt)}</b></td><td><button class="btn tiny" data-act="examView" data-v="${i}">ansehen</button></td></tr>`).reverse().join("")}</table>` : "<p>Noch keine Probearbeit geschrieben.</p>"}
        <h3>Themen</h3>
        <table class="tab wide">${A.TOPICS.map((t) => { const n = t.gens.reduce((a, id) => a + (S.gens[id] ? S.gens[id].n : 0), 0), ok = t.gens.reduce((a, id) => a + (S.gens[id] ? S.gens[id].ok : 0), 0); return `<tr><th>${t.icon} ${t.name}</th><td>${topicPct(t)} %</td><td>${n} Aufgaben, ${ok} auf Anhieb richtig</td></tr>`; }).join("")}</table>
        <p class="small">Insgesamt ${S.stats.tasks} Aufgaben, ${S.stats.ok} richtig, ${Object.keys(S.days).length} Übungstage. Fehlerkiste: ${S.box.length}.</p>
        <button class="btn danger" data-act="reset">Alles zurücksetzen</button>
      </div></main>`;
  }

  // ---------- Rendern ----------
  function render() {
    applyTheme();
    const v = {
      home: vHome, topic: vTopic, practice: vPractice, roundEnd: vRoundEnd, examIntro: vExamIntro, exam: vExam, examResult: vExamResult, album: vAlbum, cozy: vCozy, settings: vSettings,
    }[view.name] || vHome;
    app.innerHTML = v();
    app.dataset.view = view.name;
    if (view.name === "exam") { examRestore(); examTick(); }
    if (view.name === "practice" && !P.cur.done) { const f = $(".task input:not([readonly])"); if (f && !TEST.noFocus && !matchMedia("(pointer: coarse)").matches) f.focus(); }
  }

  // ---------- Ereignisse ----------
  app.addEventListener("click", (e) => {
    const hit = e.target.closest(".hit");
    if (hit) { const w = hit.closest(".placewrap"); if (w && !hit.dataset.locked && !(P && P.cur && P.cur.done && view.name === "practice")) { placeSel(w, Number(hit.dataset.v)); sound("tap"); if (view.name === "exam") examSaveAnswers(); } return; }
    const b = e.target.closest("[data-act]");
    if (!b || b.dataset.locked) return;
    const act = b.dataset.act, v = b.dataset.v;
    switch (act) {
      case "home": go("home"); break;
      case "topic": go("topic", { topic: v }); break;
      case "startTopic": startPractice("topic", { topic: v }); break;
      case "startGen": startPractice("gen", { gen: v }); break;
      case "mix": startPractice("mix"); break;
      case "box": if (S.box.length) startPractice("box"); break;
      case "again": startPractice(P.mode === "box" && !S.box.length ? "mix" : P.mode, { topic: P.topic, gen: P.gen }); break;
      case "quit": if (P && P.res.length && !confirm("Runde abbrechen? Bisherige Ergebnisse bleiben gespeichert.")) return; go(P && P.mode === "topic" ? "topic" : P && P.mode === "gen" ? "topic" : "home", { topic: P && (P.topic || (P.gen && A.G[P.gen].topic)) }); break;
      case "help": { const c = P.cur; if (c.help <= c.t.hints.length) { const inp = readInput(c.t, $(".task")); c.help++; c.say = c.help > c.t.hints.length ? "Schau dir den Weg in Ruhe an. Dann probier es selbst." : "Hier ist ein Tipp für dich."; render(); restoreInput(c.t, inp); } break; }
      case "check": doCheck(); break;
      case "next": P.i++; if (P.i >= P.total) { go("roundEnd"); } else { nextTask(); render(); window.scrollTo(0, 0); } break;
      case "opt": { const box = b.closest(".opts"); $$(".opt", box).forEach((o) => o.classList.toggle("sel", o === b)); sound("tap"); if (view.name === "exam") examSaveAnswers(); break; }
      case "ord": { const w = b.closest(".orderwrap"), seq = JSON.parse(w.dataset.seq), n = Number(v); if (!seq.includes(n)) { seq.push(n); w.dataset.seq = JSON.stringify(seq); drawSeq(w); sound("tap"); if (view.name === "exam") examSaveAnswers(); } break; }
      case "ordReset": { const w = b.closest(".orderwrap"); w.dataset.seq = "[]"; drawSeq(w); if (view.name === "exam") examSaveAnswers(); break; }
      case "examIntro": go("examIntro"); break;
      case "examStart": startExam(); break;
      case "examResume": EX = examFromState(); if (EX && remain() > 0) go("exam"); else if (EX) { go("exam"); submitExam(); } break;
      case "examPause": examSaveAnswers(); clearInterval(tick); if (confirm("Probearbeit unterbrechen? Die Uhr läuft weiter – du kannst sie auf der Startseite fortsetzen.")) go("home"); else examTick(); break;
      case "examSubmit": { const open = EX.parts.reduce((a, p, ai) => a + p.tasks.filter((t, ti) => isEmpty(t, readInput(t, $(`[data-k="${ai}.${ti}"]`)))).length, 0); if (confirm(open ? `Noch ${open} Aufgabe${open > 1 ? "n" : ""} ohne Antwort. Trotzdem abgeben?` : "Wirklich abgeben?")) submitExam(); break; }
      case "examView": view = { name: "examResult", idx: Number(v) }; render(); window.scrollTo(0, 0); break;
      case "album": go("album"); break;
      case "cozy": go("cozy"); break;
      case "settings": go("settings"); break;
      case "scene": S.scene = v; save(); render(); break;
      case "wear": S.wear = S.wear.includes(v) ? S.wear.filter((x) => x !== v) : S.wear.concat(v); save(); render(); break;
      case "locked": toast("🔒 Sammle mehr 🍂 Blätter, um das freizuschalten."); break;
      case "music": toggleMusic(); break;
      case "reset": if (confirm("Wirklich alles löschen? Fortschritt, Sticker und Probearbeiten sind dann weg.")) { const keep = S.set; S = fresh(); S.set = keep; save(); go("home"); } break;
    }
  });
  function toggleMusic() {
    if (C.Lofi.on) { C.Lofi.stop(); S.music.on = false; }
    else { C.Lofi.start(S.music.vol); S.music.on = true; }
    save();
    $$(".music").forEach((m) => { m.classList.toggle("on", C.Lofi.on); m.textContent = C.Lofi.on ? "♫" : "♪"; });
  }
  // Kästchen: nach einer Ziffer automatisch weiter (Ergebnis von rechts nach links)
  app.addEventListener("input", (e) => {
    const x = e.target;
    if (x.classList.contains("cell")) {
      x.value = x.value.replace(/[^0-9]/g, "").slice(-1);
      const dir = x.dataset.adv;
      if (x.value && dir) {
        const row = x.closest(".wrow, .cellrow"), ins = $$("input.cell", row), i = ins.indexOf(x), n = ins[dir === "l" ? i - 1 : i + 1];
        if (n) n.focus();
      }
    }
    if (view.name === "exam") { clearTimeout(x._t); x._t = setTimeout(examSaveAnswers, 300); }
    if (view.name === "practice" && P && P.cur && P.cur.msg) { P.cur.msg = ""; const w = $(".fb.warn"); if (w) w.remove(); }
  });
  app.addEventListener("keydown", (e) => {
    const x = e.target;
    if (e.key === "Backspace" && x.classList.contains("cell") && !x.value && x.dataset.adv) {
      const row = x.closest(".wrow, .cellrow"), ins = $$("input.cell", row), i = ins.indexOf(x), n = ins[x.dataset.adv === "l" ? i + 1 : i - 1];
      if (n) { n.focus(); n.value = ""; e.preventDefault(); }
    }
    if (e.key === "Enter" && view.name === "practice") { e.preventDefault(); if (P.cur.done) $('[data-act="next"]').click(); else doCheck(); }
  });
  app.addEventListener("change", (e) => {
    const x = e.target;
    if (x.dataset.set) {
      const k = x.dataset.set;
      if (k === "date") S.set.date = x.value || S.set.date;
      if (k === "examMin") S.set.examMin = Number(x.value);
      if (k === "theme") { S.set.theme = x.value; applyTheme(); }
      if (k === "sound") S.sound = x.checked;
      if (k === "vol") { S.music.vol = Number(x.value); C.Lofi.setVol(S.music.vol); }
      save();
    }
    if (x.dataset.key != null) {
      const i = Number(x.dataset.key), val = Math.max(0, Math.min(100, Number(x.value) || 0));
      S.set.key[i] = val; save();
    }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden && view.name === "exam") examSaveAnswers(); if (!document.hidden) applyTheme(); });

  // ---------- Start ----------
  if (S.exam) { EX = examFromState(); }
  render();
  checkStickers();
  if ("serviceWorker" in navigator && location.protocol !== "file:" && !TEST.noSW) navigator.serviceWorker.register("sw.js").catch(() => {});
  window.__EMMA = { get S() { return S; }, A, C, go, get view() { return view; }, get P() { return P; }, get EX() { return EX; }, save, render, submitExam };
})();
