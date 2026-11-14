// Naturwissenschaften Klasse 5: Erde im Weltall (Sonnensystem, Sterne und Monde, ISS, Gradnetz der Erde).
// Inhalt nach den Arbeitsblättern und Heftseiten aus dem Unterricht. Meldet sich bei Aufgaben (aufgaben.js) an.
// Jede Aufgabe ist aus (Generator, Stufe, Zufallszahl) reproduzierbar, damit die Fehlerkiste sie wiederfindet.
(function (root) {
  "use strict";
  const A = typeof module !== "undefined" && module.exports ? require("./aufgaben.js") : root.Aufgaben;
  const { G, TOPICS, R } = A;

  // ---------- Bausteine ----------
  const norm = (s) => String(s == null ? "" : s).toLowerCase().replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/[^a-z0-9]/g, "");
  const T = (o) => Object.assign({ kind: "text", pts: 1, hints: [], unit: "" }, o);
  const textTask = (o) => T(Object.assign({ kind: "text", check: (s) => ({ ok: o.accept.some((a) => norm(a) === norm(s)) }), answer: o.accept[0] }, o));
  const choiceTask = (o) => T(Object.assign({ kind: "choice", check: (i) => ({ ok: Number(i) === o.correct }), answer: o.options[o.correct] }, o));
  const numTask = (o) => T(Object.assign({ kind: "num", check: (s) => ({ ok: A.parseNum(s) === o.ans }), answer: String(o.ans) }, o));
  const gen = (id, topic, name, f, o) => { G[id] = Object.assign({ id, topic, name, f, lvls: [1, 2, 3] }, o || {}); };
  // richtige Antwort plus drei andere, gemischt
  function opts(r, right, pool, n) {
    const others = r.shuffle(pool.filter((x) => x !== right)).slice(0, (n || 4) - 1);
    const all = r.shuffle([right].concat(others));
    return { options: all, correct: all.indexOf(right) };
  }

  // ---------- Daten ----------
  const PLANETEN = ["Merkur", "Venus", "Erde", "Mars", "Jupiter", "Saturn", "Uranus", "Neptun"];
  const MERKSATZ = ["Mein", "Vater", "erklärt", "mir", "jeden", "Samstag", "unseren", "Nachthimmel"];
  // Durchmesser in km (für die Größenordnung) und Abstand zur Sonne in Mio. km: nur zur Kontrolle der Reihenfolgen
  const DURCHMESSER = { Merkur: 4879, Venus: 12104, Erde: 12742, Mars: 6779, Jupiter: 139820, Saturn: 116460, Uranus: 50724, Neptun: 49244 };
  const ABSTAND = { Merkur: 58, Venus: 108, Erde: 150, Mars: 228, Jupiter: 778, Saturn: 1427, Uranus: 2871, Neptun: 4498 };
  const GROESSE = PLANETEN.slice().sort((a, b) => DURCHMESSER[b] - DURCHMESSER[a]); // Jupiter, Saturn, Uranus, Neptun, Erde, Venus, Mars, Merkur
  // Hinweise, die jeweils zu genau einem Planeten passen (Steckbriefe aus dem Heft)
  const STECK = [
    ["Merkur", "ist der Sonne am nächsten"], ["Merkur", "umkreist die Sonne am schnellsten"], ["Merkur", "ist der kleinste Planet"], ["Merkur", "ist mit ganz vielen Kratern übersät"],
    ["Venus", "ist der heißeste Planet"], ["Venus", "ist der hellste Planet und heißt auch Abendstern"], ["Venus", "ist der einzige Planet, der sich linksherum dreht"],
    ["Erde", "heißt auch der blaue Planet, weil sie zum größten Teil mit Wasser bedeckt ist"], ["Erde", "ist der einzige Planet, auf dem es Leben gibt"],
    ["Mars", "ist der einzige rote Planet"], ["Mars", "trägt den Namen des römischen Kriegsgottes"], ["Mars", "ist rot, weil er aus sehr viel Eisen besteht und rostet"],
    ["Jupiter", "ist der größte Planet"], ["Jupiter", "hat ein „Rotes Auge“ auf der Oberfläche, fast doppelt so groß wie die Erde"],
    ["Saturn", "ist vor allem wegen seiner Ringe aus Staub und Eisbrocken bekannt"], ["Saturn", "ist der zweitgrößte Planet"],
    ["Uranus", "ist der drittgrößte Planet"], ["Uranus", "leuchtet von der Erde aus blau-grün"],
    ["Neptun", "ist nach dem griechischen Meeresgott benannt"], ["Neptun", "ist der windigste und kälteste Planet"],
  ];
  const BEGRIFFE = {
    Stern: "eine selbst leuchtende Gaskugel",
    Planet: "ein Himmelskörper, der sich um einen Stern bewegt und nicht selbst leuchtet, sondern das Sonnenlicht zurückstrahlt",
    Mond: "ein Himmelskörper, der einen Planeten umkreist (auch Trabant oder „Begleiter“ genannt)",
  };
  const AUSSAGEN = [
    ["Die Sonne ist ein Stern.", true], ["Sterne leuchten selbst.", true], ["Planeten leuchten selbst.", false], ["Planeten strahlen das Sonnenlicht zurück.", true],
    ["Monde umkreisen Planeten.", true], ["Monde sind selbst leuchtende Sterne.", false], ["Unsere Sonne ist einer von mehr als 100 Milliarden Sternen.", true],
    ["Es gibt nur diesen einen Stern, die Sonne.", false], ["Die Sonne ist ein riesiger, brennender Gasball.", true], ["Die Erde ist der einzige Planet mit Leben.", true],
    ["Merkur ist der größte Planet.", false], ["Jupiter ist der größte Planet.", true], ["Venus ist der kälteste Planet.", false], ["Mars ist der rote Planet.", true],
    ["Saturn ist wegen seiner Ringe bekannt.", true], ["Neptun ist der Sonne am nächsten.", false], ["Die inneren Planeten sind fest.", true], ["Die äußeren Planeten sind gasförmig.", true],
  ];
  const ISS_SCHRITTE = [
    "Die Astronautinnen und Astronauten stehen auf.", "Sie frühstücken und besprechen den Tagesplan.", "Die Crew führt Experimente durch oder wartet Geräte.",
    "Die Crew macht Sport.", "Die Crew bespricht die Ergebnisse und plant den nächsten Tag.",
  ];
  const ISS_FAKTEN = [
    ["In welcher Höhe kreist die ISS ungefähr um die Erde?", "400 Kilometer", ["40 Kilometer", "4 000 Kilometer", "40 000 Kilometer"]],
    ["Wie schnell bewegt sich die ISS ungefähr?", "28 000 Kilometer pro Stunde", ["280 Kilometer pro Stunde", "2 800 Kilometer pro Stunde", "280 000 Kilometer pro Stunde"]],
    ["Wie oft umrundet die ISS ungefähr die Erde?", "alle 90 Minuten", ["alle 9 Minuten", "alle 24 Stunden", "einmal pro Woche"]],
    ["Wie nennt man den Zustand, in dem Menschen und Dinge auf der ISS schweben?", "Mikrogravitation", ["Experiment", "Wasseraufbereitung", "Zeitplan"]],
    ["Warum schweben Menschen und Dinge auf der ISS?", "weil die Raumstation und alles in ihr gemeinsam um die Erde fallen", ["weil es dort keine Erde gibt", "weil die ISS sehr weit weg von allen Sternen ist", "weil alles dort befestigt ist"]],
    ["Warum gehört Sport zum täglichen Programm?", "weil Muskeln und Knochen in der Schwerelosigkeit weniger belastet werden", ["weil es dort sonst langweilig ist", "weil die Muskeln dort stärker belastet werden", "weil man sonst nicht schweben kann"]],
    ["Wie lange trainiert die Crew ungefähr pro Tag?", "ungefähr zwei Stunden", ["ungefähr zwei Minuten", "ungefähr zehn Stunden", "gar nicht"]],
    ["Warum trinkt die Crew aus verschlossenen Beuteln mit Strohhalm?", "weil Wasser kleine schwebende Kugeln bildet", ["weil es auf der ISS kein Wasser gibt", "weil Gläser zu teuer sind", "weil das Wasser dort sehr heiß ist"]],
    ["Wie viele Sonnenaufgänge erlebt die Crew ungefähr innerhalb von 24 Stunden?", "16", ["1", "4", "90"]],
    ["Was passiert mit dem Wasser auf der ISS?", "Es wird aufbereitet, also gereinigt und wieder verwendet", ["Es wird nach jedem Tag weggeschüttet", "Es wird aus der Erde geholt", "Es wird gar nicht benutzt"]],
  ];
  const ISS_BEGRIFFE = [
    ["Mikrogravitation", "Zustand, in dem Menschen und Dinge scheinbar schwerelos schweben"],
    ["Experiment", "Geräte und Gegenstände untersuchen, um Neues herauszufinden"],
    ["Wasseraufbereitung", "Wasser reinigen, damit es wieder verwendet werden kann"],
  ];
  const GRAD = [
    ["Wie heißt der größte Breitenkreis?", "der Äquator", ["der Nullmeridian", "der Nordpol", "die Erdachse"]],
    ["Was teilt die Erde in eine nördliche und eine südliche Halbkugel?", "der Äquator", ["der Nullmeridian", "die Erdachse", "ein Längenkreis"]],
    ["Wie lautet die Übersetzung des Wortes „Äquator“?", "Gleichmacher", ["Mittelpunkt", "Nordweg", "Rundlinie"]],
    ["Durch welche Stadt verläuft der Nullmeridian?", "Greenwich (London)", ["Paris", "Berlin", "New York"]],
    ["Wo verlaufen alle Längenkreise?", "von Pol zu Pol", ["parallel zum Äquator", "nur auf der Nordhalbkugel", "nur durch England"]],
    ["Wie viele Längenkreise gibt es insgesamt?", "360", ["90", "180", "1 000"]],
    ["Wie sind die Längenkreise?", "alle gleich lang", ["am Äquator am längsten, an den Polen Punkte", "alle verschieden lang", "gar nicht gleich"]],
    ["Wie verlaufen die Breitenkreise?", "in gleicher Richtung wie der Äquator", ["von Pol zu Pol", "senkrecht zum Äquator", "kreuz und quer"]],
    ["Was passiert mit den Breitenkreisen zu den Polen hin?", "Sie werden immer kleiner, an den Polen sind sie nur noch Punkte", ["Sie werden immer größer", "Sie bleiben gleich groß", "Sie verschwinden am Äquator"]],
    ["Woran orientieren sich alle anderen Längenkreise?", "am Nullmeridian", ["am Äquator", "am Nordpol", "an der Erdachse"]],
    ["Was braucht man, um die Lage eines Ortes auf der Erdkugel genau zu beschreiben?", "Breitenkreise und Längenkreise zusammen", ["nur den Äquator", "nur den Nullmeridian", "nur die Erdachse"]],
  ];
  // Lückensätze zum Gradnetz: [Satz mit ___, Lösung(en), Wortkasten-Hinweis]
  const LUECKEN = [
    ["Der ___ teilt die Erde in eine nördliche und südliche Halbkugel.", ["Äquator"], "Äquator, Nullmeridian, Nordpol"],
    ["Der ___ ist ein wichtiger Längenkreis. An ihm orientieren sich alle anderen Längenkreise.", ["Nullmeridian"], "Äquator, Nullmeridian, Südpol"],
    ["Der Nullmeridian verläuft durch die englische Stadt ___.", ["Greenwich", "London"], "Greenwich, Paris, Berlin"],
    ["Alle Längenkreise verlaufen vom ___ zum Südpol.", ["Nordpol"], "Nordpol, Äquator, Nullmeridian"],
    ["Die Breitenkreise werden zu den Polen hin immer ___.", ["kleiner"], "kleiner, größer, länger"],
    ["An den Polen sind die Breitenkreise nur noch ___.", ["Punkte", "Punkt"], "Punkte, Linien, Kreise"],
    ["Der Äquator ist der größte ___.", ["Breitenkreis"], "Breitenkreis, Längenkreis, Pol"],
    ["Mit Breitenkreisen und Längenkreisen kann man die Lage jedes Ortes auf der ___ genau beschreiben.", ["Erdkugel", "Erde"], "Erdkugel, Sonne, Karte"],
    ["Sterne sind selbst ___ Gaskugeln.", ["leuchtende", "leuchtend"], "leuchtende, kalte, feste"],
    ["Himmelskörper, die einen Planeten umkreisen, nennt man Trabanten oder ___.", ["Monde", "Mond"], "Monde, Sterne, Sonnen"],
    ["Planeten leuchten nicht selbst, sondern strahlen das ___ zurück.", ["Sonnenlicht", "Licht"], "Sonnenlicht, Mondlicht, Feuer"],
  ];

  // ---------- Bilder ----------
  const PCOL = { Merkur: "#9a9a9a", Venus: "#e4a24d", Erde: "#3f86c9", Mars: "#c9543a", Jupiter: "#d9a066", Saturn: "#e2c26a", Uranus: "#7fd0d6", Neptun: "#3a5fc8" };
  const PRAD = { Merkur: 4, Venus: 6, Erde: 6.5, Mars: 5, Jupiter: 17, Saturn: 14, Uranus: 10, Neptun: 10 };
  function sonnensystemSvg() {
    let x = 62, s = `<svg class="nwfig" viewBox="0 0 420 110" role="img" aria-label="Die Sonne und die acht Planeten mit den Nummern 1 bis 8"><rect width="420" height="110" rx="10" fill="#1d1a38"/><circle cx="0" cy="45" r="52" fill="#f3b83a"/><circle cx="0" cy="45" r="44" fill="#f7cf5c"/>`;
    PLANETEN.forEach((p, i) => {
      const rad = PRAD[p];
      s += `<circle cx="${x}" cy="45" r="${rad}" fill="${PCOL[p]}"/>`;
      if (p === "Saturn") s += `<ellipse cx="${x}" cy="45" rx="${rad + 9}" ry="4" fill="none" stroke="#efdca0" stroke-width="2"/>`;
      s += `<circle cx="${x}" cy="92" r="9" fill="#fff"/><text x="${x}" y="96" text-anchor="middle" font-size="11" font-weight="700" fill="#222">${i + 1}</text>`;
      x += rad + (PRAD[PLANETEN[i + 1]] || 0) + 24;
    });
    return s + "</svg>";
  }
  // Gradnetz: hl = das rot markierte Teil
  function gradnetzSvg(hl) {
    const cx = 120, cy = 120, r = 80, RED = "#e0364d", BASE = "#6b86a3";
    const c = (k) => (hl === k ? RED : BASE), w = (k) => (hl === k ? 4.5 : 1.3);
    let s = `<svg class="nwfig globe" viewBox="0 0 240 240" role="img" aria-label="Gradnetz der Erde, ein Teil ist rot markiert"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#d2e8f6" stroke="${BASE}" stroke-width="1.6"/>`;
    if (hl === "nordhalb") s += `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} Z" fill="#f3b3bb" opacity=".8"/>`;
    if (hl === "suedhalb") s += `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 0 ${cx + r} ${cy} Z" fill="#f3b3bb" opacity=".8"/>`;
    // Breitenkreise bei 30° und 60° Nord und Süd
    for (const lat of [30, 60, -30, -60]) {
      const y = cy - r * Math.sin((lat * Math.PI) / 180), hw = r * Math.cos((lat * Math.PI) / 180), mark = hl === "breite" && lat === 30;
      s += `<line x1="${cx - hw}" y1="${y}" x2="${cx + hw}" y2="${y}" stroke="${mark ? RED : BASE}" stroke-width="${mark ? 4.5 : 1.3}"/>`;
    }
    // Längenkreise: Ellipsen, bei 60° einer markiert
    for (const lon of [30, 60, 90, 120, 150]) { const rx = r * Math.abs(Math.sin((lon * Math.PI) / 180)), mark = hl === "laenge" && lon === 60; s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${r}" fill="none" stroke="${mark ? RED : BASE}" stroke-width="${mark ? 4.5 : 1.3}"/>`; }
    s += `<line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${c("aequator")}" stroke-width="${hl === "aequator" ? 4.5 : 2}"/>`;
    s += `<line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" stroke="${c("nullmeridian")}" stroke-width="${hl === "nullmeridian" ? 4.5 : 2}"/>`;
    s += `<line x1="${cx}" y1="${cy - r - 22}" x2="${cx}" y2="${cy + r + 22}" stroke="${hl === "achse" ? RED : "#4a3a2a"}" stroke-width="${hl === "achse" ? 4.5 : 2.2}" ${hl === "achse" ? "" : 'stroke-dasharray="1 0"'}/>`;
    s += `<circle cx="${cx}" cy="${cy - r}" r="${hl === "nordpol" ? 7 : 3}" fill="${hl === "nordpol" ? RED : "#4a3a2a"}"/><circle cx="${cx}" cy="${cy + r}" r="${hl === "suedpol" ? 7 : 3}" fill="${hl === "suedpol" ? RED : "#4a3a2a"}"/>`;
    return s + "</svg>";
  }
  const GRAD_TEILE = [["aequator", "Äquator"], ["nullmeridian", "Nullmeridian"], ["nordpol", "Nordpol"], ["suedpol", "Südpol"], ["achse", "Erdachse"], ["laenge", "Längenkreis"], ["breite", "Breitenkreis"], ["nordhalb", "Nordhalbkugel"], ["suedhalb", "Südhalbkugel"]];

  // ---------- Generatoren: Sonnensystem ----------
  gen("nw.reihenfolge", "sonne", "Reihenfolge der Planeten", (r, lvl) => {
    const i = r.int(0, 7), p = PLANETEN[i];
    if (lvl === 3) return textTask({ q: `Welcher Planet ist der <b>${i + 1}.</b> von der Sonne aus? Schreibe den Namen.`, accept: [p], hints: ["Sprich den Merksatz: Mein Vater erklärt mir jeden Samstag unseren Nachthimmel.", "Zähle die Wörter bis zum " + (i + 1) + ". Wort."], solution: `Der ${i + 1}. Planet ist ${p}.` });
    if (lvl === 2) { const o = opts(r, String(i + 1), ["1", "2", "3", "4", "5", "6", "7", "8"]); return choiceTask(Object.assign({ q: `Der wievielte Planet von der Sonne aus ist <b>${p}</b>?`, hints: ["Merksatz: Mein Vater erklärt mir jeden Samstag unseren Nachthimmel.", "Merkur ist Nummer 1, Venus Nummer 2, Erde Nummer 3 …"], solution: `${p} ist der ${i + 1}. Planet.` }, o)); }
    const o = opts(r, p, PLANETEN);
    return choiceTask(Object.assign({ q: `Welcher Planet ist der <b>${i + 1}.</b> von der Sonne aus?`, hints: ["Merksatz: Mein Vater erklärt mir jeden Samstag unseren Nachthimmel.", "Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus, Neptun."], solution: `Der ${i + 1}. Planet ist ${p}.` }, o));
  });
  gen("nw.merksatz", "sonne", "Merksatz „Mein Vater erklärt …“", (r, lvl) => {
    const i = r.int(0, 7), p = PLANETEN[i], w = MERKSATZ[i];
    if (lvl === 3) return textTask({ q: `Merksatz: Mein Vater erklärt mir jeden Samstag unseren Nachthimmel. Welches Wort steht für <b>${p}</b>?`, accept: [w], hints: [`${p} ist der ${i + 1}. Planet.`, `Das ${i + 1}. Wort im Merksatz.`], solution: `${p} = ${w}` });
    if (lvl === 2) { const o = opts(r, w, MERKSATZ); return choiceTask(Object.assign({ q: `Welches Wort aus dem Merksatz steht für <b>${p}</b>?`, hints: [`${p} ist der ${i + 1}. Planet.`, "Das passende Wort ist ebenfalls das " + (i + 1) + ". Wort."], solution: `${p} = ${w}` }, o)); }
    const o = opts(r, p, PLANETEN);
    return choiceTask(Object.assign({ q: `Merksatz: Mein Vater erklärt mir jeden Samstag unseren Nachthimmel. Für welchen Planeten steht das Wort <b>„${w}“</b>?`, hints: [`Das ${i + 1}. Wort steht für den ${i + 1}. Planeten.`, "Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus, Neptun."], solution: `${w} = ${p}` }, o));
  });
  gen("nw.typ", "sonne", "Innere und äußere Planeten", (r, lvl) => {
    const i = r.int(0, 7), p = PLANETEN[i], innen = i < 4, k = r.int(0, 2);
    if (k === 0 && lvl > 1) return numTask({ q: "Wie viele Planeten hat unser Sonnensystem?", ans: 8, hints: ["Die Reihenfolge im Merksatz hat 8 Wörter.", "Pluto zählt seit 2006 nicht mehr als Planet (Zwergplanet)."], solution: "8 Planeten", pts: 1 });
    if (k === 1) return choiceTask({ q: `Ist <b>${p}</b> ein innerer oder ein äußerer Planet?`, options: ["innerer Planet", "äußerer Planet"], correct: innen ? 0 : 1, hints: ["Die inneren Planeten sind die vier nächsten bei der Sonne.", "Innen: Merkur, Venus, Erde, Mars. Außen: Jupiter, Saturn, Uranus, Neptun."], solution: `${p} ist ein ${innen ? "innerer" : "äußerer"} Planet.` });
    return choiceTask({ q: `Wie ist die Oberfläche von <b>${p}</b>?`, options: ["fest", "gasförmig"], correct: innen ? 0 : 1, hints: ["Innere Planeten sind fest, äußere sind gasförmig.", `${p} ist der ${i + 1}. Planet.`], solution: `${p}: ${innen ? "fest (innerer Planet)" : "gasförmig (äußerer Planet)"}` });
  });
  gen("nw.steckbrief", "sonne", "Planeten erkennen", (r, lvl) => {
    const [p, clue] = r.pick(STECK);
    const q = `Welcher Planet ${clue}?`;
    if (lvl === 3) return textTask({ q: q + " Schreibe den Namen.", accept: [p], hints: ["Denk an deine Planetenkärtchen im Heft.", "Es ist einer der acht Planeten: " + PLANETEN.join(", ") + "."], solution: p });
    const o = opts(r, p, PLANETEN);
    return choiceTask(Object.assign({ q, hints: ["Denk an deine Planetenkärtchen im Heft.", "Es ist einer der acht Planeten."], solution: p }, o));
  });
  gen("nw.groesse", "sonne", "Größe der Planeten", (r, lvl) => {
    const k = r.int(0, 3);
    if (k === 3 && lvl > 1) { const a = r.pick(PLANETEN); let b = r.pick(PLANETEN); while (b === a) b = r.pick(PLANETEN); const right = DURCHMESSER[a] > DURCHMESSER[b] ? a : b; return choiceTask({ q: `Welcher Planet ist größer: <b>${a}</b> oder <b>${b}</b>?`, options: [a, b], correct: right === a ? 0 : 1, hints: ["Jupiter ist der größte, dann Saturn, Uranus, Neptun.", "Danach folgen Erde, Venus, Mars und der kleinste: Merkur."], solution: `${right} ist größer.` }); }
    const rang = r.int(1, 4), p = GROESSE[rang - 1], o = opts(r, p, GROESSE.slice(0, 5));
    return choiceTask(Object.assign({ q: `Welcher Planet ist der <b>${rang === 1 ? "größte" : rang + ".-größte"}</b> Planet unseres Sonnensystems?`, hints: ["Es ist einer der vier Riesenplaneten.", "Jupiter, Saturn, Uranus, Neptun, absteigend nach der Größe."], solution: p }, o));
  });
  gen("nw.bild", "sonne", "Planeten am Bild", (r) => {
    const i = r.int(0, 7), p = PLANETEN[i], o = opts(r, p, PLANETEN);
    return choiceTask(Object.assign({ q: `<div class="nwfigw">${sonnensystemSvg()}</div>Welcher Planet trägt die Nummer <b>${i + 1}</b>?`, hints: ["Die Nummern zählen von der Sonne aus.", "Merksatz: Mein Vater erklärt mir jeden Samstag unseren Nachthimmel."], solution: `Nummer ${i + 1} ist ${p}.` }, o));
  });

  // ---------- Generatoren: Sterne, Planeten und Monde ----------
  gen("nw.begriff", "sterne", "Stern, Planet oder Mond?", (r, lvl) => {
    const keys = Object.keys(BEGRIFFE), k = r.pick(keys);
    if (r.chance(0.5)) { const o = opts(r, BEGRIFFE[k], keys.map((x) => BEGRIFFE[x]).concat(["ein Himmelskörper, der nur nachts sichtbar ist"]), 4); return choiceTask(Object.assign({ q: `Was ist ${k === "Stern" ? "ein <b>Stern</b>" : k === "Planet" ? "ein <b>Planet</b>" : "ein <b>Mond</b>"}?`, hints: ["Stern: leuchtet selbst. Planet: leuchtet nicht selbst. Mond: umkreist einen Planeten.", "Lies im Heft „Sterne, Planeten und Monde“ nach."], solution: `${k}: ${BEGRIFFE[k]}.` }, o)); }
    const o = opts(r, k, ["Stern", "Planet", "Mond", "Sonne"]);
    return choiceTask(Object.assign({ q: `Wie heißt das? <i>${BEGRIFFE[k]}</i>`, hints: ["Stern: leuchtet selbst. Planet: leuchtet nicht selbst. Mond: umkreist einen Planeten.", "Lies im Heft „Sterne, Planeten und Monde“ nach."], solution: k }, o));
  });
  gen("nw.stimmt", "sterne", "Stimmt das?", (r) => {
    const [s, ok] = r.pick(AUSSAGEN);
    return choiceTask({ q: `Stimmt die Aussage? <span class="nwsatz">${s}</span>`, options: ["stimmt", "stimmt nicht"], correct: ok ? 0 : 1, hints: ["Denk an deine Heftseiten und Kärtchen.", ok ? "Diese Aussage steht so im Heft." : "Tipp: Hier ist etwas vertauscht."], solution: ok ? "Das stimmt." : "Das stimmt nicht." });
  });
  gen("nw.luecke", "sterne", "Lückentext", (r, lvl) => {
    const [s, ans, box] = r.pick(LUECKEN);
    return textTask({ q: `Ergänze: <span class="nwsatz">${s.replace("___", '<span class="kbx">?</span>')}</span>${lvl === 1 ? `<br><small>Wortkasten: ${box}</small>` : ""}`, accept: ans, hints: [`Wortkasten: ${box}`, "Das Wort beginnt mit " + ans[0][0].toUpperCase() + "."], solution: ans[0] });
  });

  // ---------- Generatoren: ISS ----------
  gen("nw.iss.fakten", "iss", "Die ISS: Fragen zum Text", (r) => {
    const [q, right, wrong] = r.pick(ISS_FAKTEN);
    const o = opts(r, right, [right].concat(wrong));
    return choiceTask(Object.assign({ q, hints: ["Lies deinen Text „Ein Tag auf der ISS“ noch einmal.", "Gelb markiert waren die wichtigsten Stellen."], solution: right }, o));
  });
  gen("nw.iss.rechnen", "iss", "Rechnen im Weltall", (r, lvl) => {
    const k = r.int(2, lvl === 1 ? 4 : lvl === 2 ? 9 : 12), v = r.int(0, 2);
    if (v === 0) return numTask({ q: `Die ISS umrundet die Erde ungefähr alle 90 Minuten. Wie viele <b>Minuten</b> dauern ${k} Erdumrundungen?`, ans: k * 90, unit: "min", hints: ["Rechne Umrundungen mal 90.", `${k} · 90`], solution: `${k} · 90 = ${k * 90} Minuten`, pts: 2 });
    if (v === 1) return numTask({ q: `Die Crew erlebt etwa 16 Sonnenaufgänge pro Tag. Wie viele Sonnenaufgänge sind es ungefähr in ${k} Tagen?`, ans: k * 16, hints: ["Tage mal 16 Sonnenaufgänge.", `${k} · 16`], solution: `${k} · 16 = ${k * 16}`, pts: 2 });
    return numTask({ q: `Die ISS umrundet die Erde alle 90 Minuten. Wie viele Umrundungen schafft sie in <b>${k * 3}</b> Stunden?`, ans: (k * 3 * 60) / 90, hints: ["1 Stunde hat 60 Minuten. Rechne die Stunden erst in Minuten um.", `${k * 3} · 60 = ${k * 3 * 60} Minuten, dann durch 90 teilen.`], solution: `${k * 3} Stunden = ${k * 3 * 60} Minuten; ${k * 3 * 60} : 90 = ${(k * 3 * 60) / 90} Umrundungen`, pts: 2 });
  });
  gen("nw.iss.reihe", "iss", "Tagesablauf auf der ISS", (r) => {
    const i = r.int(0, 3), vor = r.chance(0.5);
    const frage = vor ? `Was passiert <b>direkt nach</b>: „${ISS_SCHRITTE[i]}“?` : `Was passiert <b>direkt vor</b>: „${ISS_SCHRITTE[i + 1]}“?`;
    const right = vor ? ISS_SCHRITTE[i + 1] : ISS_SCHRITTE[i];
    const o = opts(r, right, ISS_SCHRITTE);
    return choiceTask(Object.assign({ q: frage, hints: ["Nummeriere den Tagesablauf: aufstehen, frühstücken, Experimente, Sport, Ergebnisse besprechen.", "Denk an deine Nummern von 1 bis 5 auf dem Arbeitsblatt."], solution: right }, o));
  });
  gen("nw.iss.begriffe", "iss", "Begriffe zur ISS", (r) => {
    const [b, e] = r.pick(ISS_BEGRIFFE);
    if (r.chance(0.5)) { const o = opts(r, e, ISS_BEGRIFFE.map((x) => x[1])); return choiceTask(Object.assign({ q: `Was bedeutet <b>${b}</b>?`, hints: ["Mikrogravitation: schweben. Experiment: untersuchen. Wasseraufbereitung: reinigen.", "Lies die Erklärung im Arbeitsblatt noch einmal."], solution: e }, o)); }
    const o = opts(r, b, ISS_BEGRIFFE.map((x) => x[0]));
    return choiceTask(Object.assign({ q: `Wie heißt das? <i>${e}</i>`, hints: ["Mikrogravitation: schweben. Experiment: untersuchen. Wasseraufbereitung: reinigen.", "Lies die Erklärung im Arbeitsblatt noch einmal."], solution: b }, o));
  });

  // ---------- Generatoren: Gradnetz ----------
  gen("nw.gradnetz.bild", "grad", "Gradnetz beschriften", (r, lvl) => {
    const pool = lvl === 1 ? GRAD_TEILE.slice(0, 5) : GRAD_TEILE, [k, name] = r.pick(pool), o = opts(r, name, pool.map((x) => x[1]));
    return choiceTask(Object.assign({ q: `<div class="nwfigw">${gradnetzSvg(k)}</div>Wie heißt der <b>rot markierte</b> Teil?`, hints: ["Längenkreise laufen von Pol zu Pol, Breitenkreise liegen wie Ringe um die Erde.", "Der Äquator ist der größte Breitenkreis, der Nullmeridian ein besonderer Längenkreis."], solution: name }, o));
  });
  gen("nw.gradnetz.fakt", "grad", "Gradnetz: Fragen", (r) => {
    const [q, right, wrong] = r.pick(GRAD);
    const o = opts(r, right, [right].concat(wrong));
    return choiceTask(Object.assign({ q, hints: ["Denk an deine Blätter zum Gradnetz der Erde.", "Längenkreise: Pol zu Pol, alle gleich lang. Breitenkreise: Ringe, am Äquator am längsten."], solution: right }, o));
  });
  gen("nw.gradnetz.luecke", "grad", "Gradnetz: Lückentext", (r, lvl) => {
    const [s, ans, box] = r.pick(LUECKEN.slice(0, 8));
    return textTask({ q: `Ergänze: <span class="nwsatz">${s.replace("___", '<span class="kbx">?</span>')}</span>${lvl === 1 ? `<br><small>Wortkasten: ${box}</small>` : ""}`, accept: ans, hints: [`Wortkasten: ${box}`, "Das Wort beginnt mit " + ans[0][0].toUpperCase() + "."], solution: ans[0] });
  });
  // Feste Fragen (Frage, Antwort, Hinweis, Lösung) und Rechenfragen mit wechselnden Zahlen
  const ZAHLEN = [
    ["Wie viele Längenkreise gibt es insgesamt?", 360, "Der Kreis hat 360 Grad, jeder Grad hat einen Längenkreis.", "360 Längenkreise"],
    ["Auf welchem Breitengrad liegt der <b>Äquator</b>?", 0, "Der Äquator ist der Anfang der Zählung der Breitengrade.", "0 Grad"],
    ["Auf welchem Längengrad liegt der <b>Nullmeridian</b> (Greenwich)?", 0, "Von hier aus zählt man nach Osten und nach Westen.", "0 Grad"],
    ["Auf welchem Breitengrad liegt der <b>Nordpol</b>? (Gib nur die Zahl ein.)", 90, "Vom Äquator bis zum Pol ist es ein Viertelkreis.", "90 Grad nördlicher Breite"],
    ["Wie viele Breitengrade sind es vom <b>Äquator bis zum Südpol</b>?", 90, "Der Südpol liegt genauso weit vom Äquator weg wie der Nordpol.", "90 Grad"],
    ["Vom Nullmeridian zählt man nach Osten bis 180 Grad. Bis wie viel Grad zählt man nach <b>Westen</b>?", 180, "Zusammen müssen es 360 Grad sein.", "180 Grad"],
    ["Die Erde dreht sich in 24 Stunden einmal ganz herum (360 Grad). Um wie viele Grad dreht sie sich in <b>einer Stunde</b>?", 15, "360 : 24", "360 : 24 = 15 Grad"],
  ];
  gen("nw.gradnetz.zahl", "grad", "Gradnetz: Zahlen", (r, lvl) => {
    const rechne = r.chance(lvl === 1 ? 0.35 : 0.5);
    if (!rechne) { const [q, ans, hint, sol] = r.pick(ZAHLEN); return numTask({ q, ans, hints: [hint, "Denk an deine Blätter zum Gradnetz der Erde."], solution: sol }); }
    const k = r.int(1, 8) * 10, v = lvl === 1 ? 0 : r.int(0, 2);
    if (v === 0) return numTask({ q: `Du startest am Äquator und gehst ${k} Grad nach Norden. Auf welchem Breitengrad bist du?`, ans: k, hints: ["Der Äquator ist 0 Grad.", `0 + ${k}`], solution: `${k} Grad nördlicher Breite` });
    if (v === 1) return numTask({ q: `Ein Schiff liegt auf ${k} Grad nördlicher Breite. Wie viele Grad sind es noch bis zum <b>Nordpol</b>?`, ans: 90 - k, hints: ["Der Nordpol liegt bei 90 Grad.", `90 − ${k}`], solution: `90 − ${k} = ${90 - k} Grad` });
    return numTask({ q: `Zwei Längenkreise liegen ${k} Grad auseinander. Wie viele Grad sind es auf der <b>anderen Seite</b> der Erde um den Kreis herum?`, ans: 360 - k, hints: ["Der ganze Kreis hat 360 Grad.", `360 − ${k}`], solution: `360 − ${k} = ${360 - k} Grad` });
  });

  // ---------- Themen ----------
  const NWT = [
    { id: "sonne", name: "Sonnensystem & Planeten", icon: "🪐", lern: true, fach: "nw" },
    { id: "sterne", name: "Sterne, Planeten & Monde", icon: "⭐", lern: true, fach: "nw" },
    { id: "iss", name: "Die ISS", icon: "🚀", lern: true, fach: "nw" },
    { id: "grad", name: "Gradnetz der Erde", icon: "🌍", lern: true, fach: "nw" },
  ];
  NWT.forEach((t) => { t.gens = Object.values(G).filter((g) => g.topic === t.id).map((g) => g.id); TOPICS.push(t); });
  const MERKE = {
    sonne: "Merksatz für die Reihenfolge: Mein Vater erklärt mir jeden Samstag unseren Nachthimmel = Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus, Neptun. Innere Planeten (Merkur bis Mars) sind fest, äußere (Jupiter bis Neptun) gasförmig. Es sind 8 Planeten.",
    sterne: "Sterne sind selbst leuchtende Gaskugeln (unsere Sonne ist einer). Planeten bewegen sich um Sterne, leuchten nicht selbst, sondern strahlen das Sonnenlicht zurück. Himmelskörper, die einen Planeten umkreisen, heißen Trabanten oder Monde.",
    iss: "ISS: ca. 400 km hoch, ca. 28 000 km/h, eine Erdumrundung alle 90 Minuten, ca. 16 Sonnenaufgänge in 24 Stunden. Mikrogravitation = alles schwebt, weil alles gemeinsam um die Erde fällt. Sport gegen Muskel- und Knochenabbau. Wasser wird aufbereitet.",
    grad: "Längenkreise: von Pol zu Pol, alle gleich lang, 360 Stück, der Nullmeridian läuft durch Greenwich (London). Breitenkreise: Ringe parallel zum Äquator, am Äquator am längsten, zu den Polen kleiner (an den Polen Punkte). Der Äquator („Gleichmacher“) teilt die Erde in Nord- und Südhalbkugel.",
  };

  // ---------- Probearbeit Naturwissenschaften ----------
  function probearbeit(seed) {
    const r = R(seed), s = () => r.int(1, 2 ** 31 - 1);
    const mk = (g, l) => { const t = A.make(g, l, s()); return t; };
    const parts = [
      ["Das Sonnensystem", [["nw.reihenfolge", 2], ["nw.reihenfolge", 3], ["nw.merksatz", 3], ["nw.bild", 1], ["nw.typ", 2]]],
      ["Planeten erkennen", [["nw.steckbrief", 3], ["nw.steckbrief", 2], ["nw.steckbrief", 2], ["nw.groesse", 2]]],
      ["Sterne, Planeten und Monde", [["nw.begriff", 2], ["nw.begriff", 2], ["nw.stimmt", 1], ["nw.luecke", 2]]],
      ["Ein Tag auf der ISS", [["nw.iss.fakten", 2], ["nw.iss.fakten", 2], ["nw.iss.reihe", 2], ["nw.iss.begriffe", 2], ["nw.iss.rechnen", 2], ["nw.iss.rechnen", 3]]],
      ["Das Gradnetz der Erde", [["nw.gradnetz.bild", 2], ["nw.gradnetz.bild", 2], ["nw.gradnetz.bild", 3], ["nw.gradnetz.fakt", 2], ["nw.gradnetz.luecke", 2], ["nw.gradnetz.luecke", 2]]],
    ];
    return parts.map(([title, ts], i) => ({ nr: i + 1, title, tasks: ts.map(([g, l]) => { const t = mk(g, l); if (t.kind === "text") t.pts = Math.max(t.pts, 2); return t; }) }));
  }

  const api = { PLANETEN, MERKSATZ, DURCHMESSER, ABSTAND, GROESSE, STECK, AUSSAGEN, ISS_SCHRITTE, ISS_FAKTEN, GRAD, LUECKEN, GRAD_TEILE, MERKE, norm, sonnensystemSvg, gradnetzSvg, probearbeit };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NW = api;
})(typeof self !== "undefined" ? self : this);
