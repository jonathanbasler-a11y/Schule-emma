// Mochi, das Capybara: Zeichnung, Outfits, gemütliche Orte, Sprüche und Lo-fi-Musik.
(function (root) {
  "use strict";

  // ---------- Mochi als SVG ----------
  // mood: calm | happy | think | sleepy | proud ; wear: Liste von Outfit-IDs
  function mochi(mood, wear, size) {
    wear = wear || [];
    const has = (k) => wear.includes(k);
    const eyes = {
      calm: `<ellipse cx="80" cy="80" rx="4.6" ry="5.2" class="eye"/><ellipse cx="120" cy="80" rx="4.6" ry="5.2" class="eye"/><circle cx="81.6" cy="78.2" r="1.5" fill="#fff"/><circle cx="121.6" cy="78.2" r="1.5" fill="#fff"/>`,
      happy: `<path d="M74 82 Q80 74 86 82" class="lid"/><path d="M114 82 Q120 74 126 82" class="lid"/>`,
      proud: `<path d="M74 82 Q80 74 86 82" class="lid"/><path d="M114 82 Q120 74 126 82" class="lid"/>`,
      sleepy: `<path d="M74 80 Q80 85 86 80" class="lid"/><path d="M114 80 Q120 85 126 80" class="lid"/>`,
      think: `<ellipse cx="80" cy="81" rx="4.4" ry="4.8" class="eye"/><path d="M114 81 L126 81" class="lid"/><path d="M73 70 L87 67" class="lid thin"/>`,
    }[mood] || "";
    const mouth = mood === "happy" || mood === "proud" ? `<path d="M92 113 Q100 121 108 113" class="lid thin"/>` : `<path d="M93 113 Q96.5 116 100 113 Q103.5 116 107 113" class="lid thin"/>`;
    let back = "", front = "", top = "";
    if (has("schal")) front += `<path d="M58 124 Q100 146 142 124 L144 136 Q100 160 56 136 Z" fill="#c8643b"/><path d="M60 128 Q100 148 140 128" stroke="#e8a27a" stroke-width="3" fill="none" stroke-dasharray="6 6"/><path d="M118 136 L126 170 L112 172 L108 140 Z" fill="#c8643b"/>`;
    if (has("tee")) front += `<g transform="translate(78 150)"><path d="M0 0 H36 Q34 24 18 24 Q2 24 0 0 Z" fill="#f4ead8" stroke="#7b5236" stroke-width="2"/><path d="M36 5 Q46 6 44 13 Q42 19 34 17" fill="none" stroke="#7b5236" stroke-width="2.5"/><path d="M10 -6 Q6 -12 10 -18 M20 -6 Q16 -13 20 -20 M28 -6 Q24 -11 28 -16" stroke="#cdb9a1" stroke-width="2" fill="none" class="steam"/><rect x="4" y="3" width="28" height="4" rx="2" fill="#a8743f" opacity=".5"/></g>`;
    if (has("muetze")) top += `<path d="M52 66 Q54 26 100 24 Q146 26 148 66 Z" fill="#d9a441"/><rect x="48" y="58" width="104" height="14" rx="7" fill="#b8862c"/><path d="M60 60 V70 M72 60 V70 M84 60 V70 M96 60 V70 M108 60 V70 M120 60 V70 M132 60 V70 M144 60 V70" stroke="#a3751f" stroke-width="2"/><circle cx="100" cy="22" r="10" fill="#f1dcae"/>`;
    if (has("yuzu")) top += `<circle cx="100" cy="40" r="15" fill="#f0a23a"/><circle cx="95" cy="35" r="3" fill="#f8c97a"/><path d="M100 26 Q108 16 116 22 Q108 28 100 26" fill="#7c9a52"/>`;
    if (has("blatt")) top += `<g transform="translate(118 40) rotate(25)"><path d="M0 0 Q12 -16 26 -2 Q14 14 0 0 Z" fill="#c8643b"/><path d="M0 0 L26 -2" stroke="#8d3f22" stroke-width="1.5"/></g>`;
    if (has("kopfhoerer")) top += `<path d="M50 84 Q50 34 100 32 Q150 34 150 84" fill="none" stroke="#6b4a6e" stroke-width="7"/><rect x="40" y="72" width="18" height="28" rx="8" fill="#8a6390"/><rect x="142" y="72" width="18" height="28" rx="8" fill="#8a6390"/>`;
    const glasses = has("brille") ? `<g fill="none" stroke="#4a3426" stroke-width="2.6"><circle cx="80" cy="80" r="11"/><circle cx="120" cy="80" r="11"/><path d="M91 79 Q100 75 109 79"/></g>` : "";
    return `<svg class="mochi m-${mood}" viewBox="0 0 200 200" width="${size || 160}" height="${size || 160}" role="img" aria-label="Mochi, das Capybara">
      ${back}
      <ellipse cx="100" cy="186" rx="64" ry="8" class="shadow"/>
      <ellipse cx="100" cy="142" rx="64" ry="46" class="fur"/>
      <ellipse cx="100" cy="152" rx="38" ry="28" class="belly"/>
      <ellipse cx="68" cy="182" rx="16" ry="8" class="paw"/><ellipse cx="132" cy="182" rx="16" ry="8" class="paw"/>
      <g class="headg">
        <ellipse cx="64" cy="52" rx="9" ry="8" class="ear"/><ellipse cx="136" cy="52" rx="9" ry="8" class="ear"/>
        <ellipse cx="64" cy="53" rx="4.5" ry="4" class="earin"/><ellipse cx="136" cy="53" rx="4.5" ry="4" class="earin"/>
        <rect x="48" y="46" width="104" height="86" rx="34" class="fur head"/>
        <rect x="62" y="86" width="76" height="42" rx="20" class="snout"/>
        <ellipse cx="88" cy="99" rx="5" ry="3.4" class="nose"/><ellipse cx="112" cy="99" rx="5" ry="3.4" class="nose"/>
        <ellipse cx="60" cy="96" rx="7" ry="4.5" class="blush"/><ellipse cx="140" cy="96" rx="7" ry="4.5" class="blush"/>
        ${eyes}${mouth}${glasses}${top}
      </g>
      ${front}
      ${mood === "sleepy" ? `<text x="150" y="40" class="zz">z</text><text x="162" y="26" class="zz small">z</text>` : ""}
      ${mood === "proud" ? `<g class="spark"><path d="M164 60 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z"/><path d="M30 44 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z"/></g>` : ""}
    </svg>`;
  }

  const OUTFITS = [
    { id: "yuzu", name: "Yuzu auf dem Kopf", xp: 0 },
    { id: "blatt", name: "Herbstblatt", xp: 60 },
    { id: "schal", name: "Kuschelschal", xp: 150 },
    { id: "tee", name: "Tasse Tee", xp: 280 },
    { id: "muetze", name: "Strickmütze", xp: 450 },
    { id: "kopfhoerer", name: "Kopfhörer", xp: 650 },
    { id: "brille", name: "Lesebrille", xp: 900 },
  ];

  // ---------- Gemütliche Orte ----------
  const SCENES = [
    { id: "onsen", name: "Onsen", xp: 0 },
    { id: "wald", name: "Herbstwald", xp: 100 },
    { id: "lese", name: "Leseecke", xp: 220 },
    { id: "regen", name: "Regentag am Fenster", xp: 380 },
    { id: "tee", name: "Teehaus", xp: 560 },
    { id: "sterne", name: "Sternenhimmel", xp: 800 },
  ];
  function scene(id) {
    const W = 400, H = 220;
    const g = {
      onsen: `<rect width="${W}" height="${H}" fill="url(#gOnsen)"/><circle cx="330" cy="50" r="26" fill="#f6d7a7" opacity=".8"/><path d="M0 160 Q60 140 120 150 T240 145 T400 150 V220 H0Z" fill="#8a9a7b"/><ellipse cx="200" cy="190" rx="170" ry="34" fill="#9cc2c4"/><ellipse cx="200" cy="186" rx="150" ry="24" fill="#b9d8d6"/>${[80, 140, 260, 320].map((x, i) => `<path class="steam" style="animation-delay:${i * 0.7}s" d="M${x} 170 q-10 -16 0 -30 q10 -14 0 -30" stroke="#fff" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/>`).join("")}${[30, 60, 340, 370].map((x) => `<ellipse cx="${x}" cy="168" rx="22" ry="12" fill="#a59a8c"/>`).join("")}`,
      wald: `<rect width="${W}" height="${H}" fill="url(#gWald)"/>${[[30, "#c8643b"], [90, "#d9a441"], [150, "#b5532e"], [250, "#d98b3a"], [320, "#c8643b"], [375, "#e0b04f"]].map(([x, c], i) => `<rect x="${x - 4}" y="${120 + (i % 2) * 10}" width="8" height="70" fill="#6e4a33"/><circle cx="${x}" cy="${110 + (i % 2) * 10}" r="${34 - (i % 3) * 4}" fill="${c}"/>`).join("")}<rect y="190" width="${W}" height="30" fill="#b98a5a"/>${Array.from({ length: 14 }, (_, i) => `<ellipse class="leaf" style="animation-delay:${i * 0.9}s;left:0" cx="${(i * 53) % 400}" cy="${(i * 37) % 120}" rx="5" ry="3" fill="${["#c8643b", "#d9a441", "#b5532e"][i % 3]}"/>`).join("")}`,
      lese: `<rect width="${W}" height="${H}" fill="#f1e2c9"/><rect x="20" y="20" width="130" height="170" fill="#8a5e3c"/>${[0, 1, 2, 3].map((r) => `<rect x="26" y="${30 + r * 40}" width="118" height="4" fill="#6e4a33"/>` + [0, 1, 2, 3, 4, 5, 6].map((b) => `<rect x="${30 + b * 16}" y="${36 + r * 40 - (b % 3) * 3}" width="12" height="${28 + (b % 3) * 3}" fill="${["#c8643b", "#d9a441", "#7c9a52", "#9a7bb0", "#e0b04f", "#b5532e", "#6d8fa8"][(b + r) % 7]}" rx="2"/>`).join("")).join("")}<path d="M330 40 L310 90 H350 Z" fill="#e0b04f"/><rect x="328" y="90" width="4" height="100" fill="#6e4a33"/><ellipse cx="330" cy="100" rx="60" ry="30" fill="#f6d7a7" opacity=".35"/><rect y="190" width="${W}" height="30" fill="#c9a77f"/><rect x="180" y="150" width="120" height="50" rx="20" fill="#c8643b"/>`,
      regen: `<rect width="${W}" height="${H}" fill="#e9dccb"/><rect x="60" y="20" width="280" height="150" rx="10" fill="#7f97a8"/><rect x="60" y="20" width="280" height="150" rx="10" fill="none" stroke="#8a5e3c" stroke-width="10"/><rect x="196" y="20" width="8" height="150" fill="#8a5e3c"/>${Array.from({ length: 22 }, (_, i) => `<line class="rain" style="animation-delay:${(i % 7) * 0.25}s" x1="${70 + (i * 13) % 260}" y1="${30 + (i * 23) % 120}" x2="${66 + (i * 13) % 260}" y2="${42 + (i * 23) % 120}" stroke="#d7e3ea" stroke-width="2" stroke-linecap="round"/>`).join("")}<rect x="40" y="168" width="320" height="14" rx="4" fill="#a8743f"/><rect y="182" width="${W}" height="38" fill="#c9a77f"/><g transform="translate(300 140)"><rect x="0" y="0" width="22" height="26" rx="4" fill="#7c9a52"/><path d="M11 0 Q0 -20 -8 -10 M11 0 Q18 -24 26 -12 M11 0 Q10 -26 14 -28" stroke="#5d7a3a" stroke-width="4" fill="none"/></g>`,
      tee: `<rect width="${W}" height="${H}" fill="#f3e6cf"/>${[0, 1, 2, 3].map((i) => `<rect x="${20 + i * 95}" y="20" width="85" height="150" fill="#fbf4e6" stroke="#8a5e3c" stroke-width="5"/><path d="M${20 + i * 95} 70 h85 M${20 + i * 95} 120 h85 M${62 + i * 95} 20 v150" stroke="#8a5e3c" stroke-width="2"/>`).join("")}<g class="lantern"><line x1="350" y1="0" x2="350" y2="30" stroke="#6e4a33" stroke-width="2"/><ellipse cx="350" cy="55" rx="22" ry="28" fill="#c8643b"/><ellipse cx="350" cy="55" rx="14" ry="28" fill="#e07a4f"/></g><rect y="170" width="${W}" height="50" fill="#b98a5a"/><rect y="170" width="${W}" height="6" fill="#8a5e3c"/>`,
      sterne: `<rect width="${W}" height="${H}" fill="url(#gNacht)"/>${Array.from({ length: 40 }, (_, i) => `<circle class="star" style="animation-delay:${(i % 9) * 0.4}s" cx="${(i * 97) % 400}" cy="${(i * 53) % 150}" r="${(i % 3) * 0.7 + 0.8}" fill="#fff4d6"/>`).join("")}<circle cx="320" cy="50" r="22" fill="#f6e3b4"/><circle cx="330" cy="44" r="20" fill="#2d2a4a"/><path d="M0 180 Q100 150 200 170 T400 165 V220 H0Z" fill="#3b3557"/><path d="M0 200 Q120 180 240 196 T400 192 V220 H0Z" fill="#2a2640"/>`,
    }[id] || "";
    return `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
      <linearGradient id="gOnsen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d9b9"/><stop offset="1" stop-color="#e9c7a0"/></linearGradient>
      <linearGradient id="gWald" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dfb8"/><stop offset="1" stop-color="#eac595"/></linearGradient>
      <linearGradient id="gNacht" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d2a4a"/><stop offset="1" stop-color="#5a4a6e"/></linearGradient>
    </defs>${g}</svg>`;
  }

  // ---------- Sprüche ----------
  const MUT = [
    "Ein Schritt nach dem anderen. Wie beim Baden: langsam reingehen.",
    "Fehler sind Wegweiser. Sie zeigen dir, wo du noch üben kannst.",
    "Du musst nicht perfekt sein. Du musst nur dranbleiben.",
    "Tief durchatmen. Lies die Aufgabe noch einmal in Ruhe.",
    "Jede Aufgabe, die du übst, macht Montag ein bisschen leichter.",
    "Langsam und richtig ist besser als schnell und falsch.",
    "Du hast schon so viel geschafft. Weiter so!",
    "Schwierig heißt nicht unmöglich. Es heißt: noch nicht.",
    "Kleine Pause? Ein Schluck Tee, dann geht's weiter.",
    "Mathe ist wie ein Puzzle: Ein Teil passt zum anderen.",
    "Mach zuerst einen Überschlag – dann weißt du, wohin die Reise geht.",
    "Heute ein bisschen besser als gestern. Das reicht völlig.",
    "Du rechnest, ich halte die Mandarine warm.",
    "Ruhig bleiben ist eine Superkraft. Capybaras wissen das.",
    "Wenn es schwer wird, frag mich einfach. Dafür bin ich da.",
    "Konzentration ist wie eine heiße Quelle: Man muss erst reingleiten.",
    "Bei jeder Aufgabe zählt: Lesen, verstehen, rechnen, prüfen.",
    "Du bist besser vorbereitet, als du denkst.",
    "Stolz sein ist erlaubt – auch auf kleine Fortschritte.",
    "Ein Fehler heute ist ein Punkt mehr am Montag.",
  ];
  const WITZ = [
    "Warum war das Mathebuch traurig? Es hatte zu viele Probleme.",
    "Was macht ein Capybara im Mathe-Unterricht? Es bleibt ganz ruhig – auch bei Brüchen.",
    "Wie nennt man ein Capybara, das gut rechnen kann? Ein Capy-Bär-echner.",
    "Treffen sich zwei Nullen. Sagt die eine: „Schicker Gürtel!“ – zur Acht.",
    "Warum ist die 6 vor der 7 weggelaufen? Weil 7 8 9 gegessen hat.",
    "Im Zweiersystem gibt es 10 Arten von Leuten: die, die es verstehen, und die, die es nicht verstehen.",
    "Was sagt die römische Zahl, wenn sie hungrig ist? „Ich hab' X-trem Hunger!“",
    "Warum rechnen Capybaras so entspannt? Sie haben immer genug Rest-Zeit.",
    "Was ist das Lieblingsessen von Mathematikern? Pi-zza.",
    "Ich wollte einen Witz übers Runden machen. Er war aber nur ungefähr lustig.",
    "Selbst Capybaras rechnen mal falsch. Dann baden sie und versuchen es nochmal.",
    "Was ist die Lieblingszahl eines Capybaras? Die 8 – sieht aus wie zwei gemütliche Badewannen übereinander.",
  ];
  const FAKT = [
    "Capy-Fakt: Capybaras sind die größten Nagetiere der Welt – bis zu 65 kg schwer!",
    "Capy-Fakt: Capybaras können bis zu 5 Minuten unter Wasser bleiben.",
    "Capy-Fakt: In Japan baden Capybaras im Winter in heißen Quellen – mit Yuzu-Früchten.",
    "Capy-Fakt: Capybaras haben Schwimmhäute zwischen den Zehen.",
    "Capy-Fakt: Andere Tiere setzen sich gern auf Capybaras. Vögel, Affen, sogar Katzen!",
    "Capy-Fakt: Ein Capybara frisst bis zu 3–4 kg Gras am Tag.",
    "Capy-Fakt: Capybaras leben in Gruppen von 10 bis 20 Tieren. Zusammen ist es gemütlicher.",
    "Capy-Fakt: Der Name kommt aus der Sprache der Tupi und heißt ungefähr „Herr der Gräser“.",
    "Capy-Fakt: Capybaras schlafen gern im Wasser – nur die Nase schaut heraus.",
    "Capy-Fakt: Ihre Zähne wachsen ihr Leben lang weiter.",
    "Capy-Fakt: Capybaras können fast 35 km/h schnell rennen. Sie tun es nur selten.",
    "Capy-Fakt: Capybaras machen Geräusche wie Klicken, Pfeifen und Schnurren.",
    "Capy-Fakt: Ein Capybara-Baby kann schon kurz nach der Geburt laufen und schwimmen.",
  ];
  const LOB = ["Richtig! Sehr gut gemacht.", "Genau so! ✨", "Stark gerechnet!", "Perfekt. Mochi ist stolz auf dich.", "Super, das sitzt!", "Ja! Ganz ruhig und richtig.", "Klasse – weiter so!", "Wunderbar sauber gelöst."];
  const TROST = ["Noch nicht ganz. Schau dir den Weg an – beim nächsten Mal klappt's.", "Kein Stress. Diese Aufgabe kommt in deine Fehlerkiste, dort üben wir sie nochmal.", "Fast! Fehler sind Wegweiser.", "Hmm, da hat sich etwas versteckt. Schauen wir es zusammen an.", "Nicht schlimm. Genau dafür übst du ja."];
  const allSpr = () => MUT.concat(WITZ, FAKT);
  function spruch(seed) { const a = allSpr(); return a[Math.abs(seed) % a.length]; }
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // ---------- Klänge und Lo-fi-Musik (Web Audio, ohne Dateien) ----------
  let actx = null;
  const ctx = () => { if (!actx) { const C = root.AudioContext || root.webkitAudioContext; if (!C) return null; actx = new C(); } if (actx.state === "suspended") actx.resume(); return actx; };
  function blip(freqs, dur, type, vol) {
    const c = ctx(); if (!c) return;
    const t0 = c.currentTime;
    freqs.forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0, t0 + i * 0.09); g.gain.linearRampToValueAtTime(vol || 0.12, t0 + i * 0.09 + 0.02); g.gain.exponentialRampToValueAtTime(0.0008, t0 + i * 0.09 + dur);
      o.connect(g).connect(c.destination); o.start(t0 + i * 0.09); o.stop(t0 + i * 0.09 + dur + 0.05);
    });
  }
  const sfx = { ok: () => blip([659, 880, 1175], 0.6, "sine", 0.1), bad: () => blip([294, 262], 0.5, "triangle", 0.07), tap: () => blip([520], 0.12, "sine", 0.05), win: () => blip([523, 659, 784, 1047], 0.9, "sine", 0.1) };

  const Lofi = (() => {
    let on = false, timer = null, master = null, filt = null, crackle = null, nextT = 0, step = 0, vol = 0.5;
    const BPM = 72, beat = 60 / BPM;
    const n2f = (n) => 440 * Math.pow(2, (n - 69) / 12);
    // Fmaj7 – Em7 – Dm7 – Cmaj7 (je 2 Takte)
    const CH = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]];
    const PENTA = [72, 74, 76, 79, 81, 84];
    let noise = null;
    function noiseBuf(c) { if (noise) return noise; const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (noise = b); }
    function pad(c, t, notes, len) {
      notes.forEach((n) => [-6, 6].forEach((det) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = "triangle"; o.frequency.value = n2f(n); o.detune.value = det;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.035, t + 0.9); g.gain.setValueAtTime(0.035, t + len - 0.6); g.gain.linearRampToValueAtTime(0, t + len + 0.4);
        o.connect(g).connect(filt); o.start(t); o.stop(t + len + 0.5);
      }));
    }
    function note(c, t, n, v) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.value = n2f(n);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0005, t + 1.4);
      o.connect(g).connect(filt); o.start(t); o.stop(t + 1.5);
    }
    function kick(c, t) {
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.25);
      g.gain.setValueAtTime(0.32, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.connect(g).connect(master); o.start(t); o.stop(t + 0.45);
    }
    function snare(c, t, v, hp) {
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = noiseBuf(c); f.type = hp ? "highpass" : "bandpass"; f.frequency.value = hp ? 7000 : 1800;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + (hp ? 0.05 : 0.18));
      s.connect(f).connect(g).connect(master); s.start(t, Math.random()); s.stop(t + 0.25);
    }
    function schedule() {
      const c = ctx(); if (!c || !on) return;
      while (nextT < c.currentTime + 0.6) {
        const t = nextT, b = step % 8; // Achtel
        const sw = b % 2 ? beat * 0.08 : 0; // etwas Swing
        if (step % 32 === 0) pad(c, t, CH[(step / 32) % 4], beat * 8);
        if (b === 0 || b === 5) kick(c, t + sw);
        if (b === 2 || b === 6) snare(c, t + sw, 0.05);
        snare(c, t + sw, 0.012, true);
        if (Math.random() < 0.22) note(c, t + sw, PENTA[Math.floor(Math.random() * PENTA.length)] - 12 * (Math.random() < 0.3 ? 1 : 0), 0.045);
        nextT += beat / 2; step++;
      }
    }
    function start(v) {
      const c = ctx(); if (!c) return false;
      vol = v == null ? vol : v;
      master = c.createGain(); master.gain.value = 0; master.gain.linearRampToValueAtTime(vol * 0.6, c.currentTime + 2);
      filt = c.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 1500; filt.Q.value = 0.4;
      filt.connect(master); master.connect(c.destination);
      // Vinyl-Knistern
      const b = c.createBuffer(1, c.sampleRate * 3, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.6 : (Math.random() * 2 - 1) * 0.012;
      crackle = c.createBufferSource(); crackle.buffer = b; crackle.loop = true;
      const cf = c.createBiquadFilter(); cf.type = "bandpass"; cf.frequency.value = 3000;
      crackle.connect(cf).connect(master); crackle.start();
      on = true; step = 0; nextT = c.currentTime + 0.1;
      timer = setInterval(schedule, 150); schedule();
      return true;
    }
    function stop() {
      on = false; clearInterval(timer);
      const c = actx; if (!c || !master) return;
      const m = master, cr = crackle;
      m.gain.cancelScheduledValues(c.currentTime); m.gain.setValueAtTime(m.gain.value, c.currentTime); m.gain.linearRampToValueAtTime(0, c.currentTime + 0.8);
      setTimeout(() => { try { cr && cr.stop(); m.disconnect(); } catch (e) { /* schon gestoppt */ } }, 1000);
    }
    function setVol(v) { vol = v; if (on && master && actx) master.gain.linearRampToValueAtTime(v * 0.6, actx.currentTime + 0.3); }
    return { start, stop, setVol, get on() { return on; } };
  })();

  root.Capy = { mochi, scene, OUTFITS, SCENES, spruch, MUT, WITZ, FAKT, LOB, TROST, pick, sfx, Lofi };
})(typeof self !== "undefined" ? self : this);
