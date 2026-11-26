// Biologie Klasse 5: Der Hund (Säugetier, Nasen-, Ohrentier, Zehengänger, Hetzjäger), Skelett, Raubtiergebiss, Hunderassen und
// Hundearbeit, ein Welpe wird geboren, die Katze als Schleichjäger. Inhalt nach den Arbeitsblättern und Heftseiten aus dem Unterricht,
// alle Fragen und Zeichnungen sind selbst gemacht. Meldet sich bei Aufgaben (aufgaben.js) an.
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
  const gen = (id, topic, name, f, o) => { G[id] = Object.assign({ id, topic, name, f, lvls: [1, 2, 3] }, o || {}); };
  function opts(r, right, pool, n) {
    const others = r.shuffle(pool.filter((x) => x !== right)).slice(0, (n || 4) - 1);
    const all = r.shuffle([right].concat(others));
    return { options: all, correct: all.indexOf(right) };
  }

  // ---------- Daten: Der Hund ----------
  const TYPEN = ["Nasentier", "Ohrentier", "Zehengänger", "Hetzjäger"];
  const TYP_AUSSAGEN = {
    Nasentier: ["Er hat eine sehr feine, empfindliche Spürnase.", "Er hilft dem Menschen als Spür- oder Suchhund, zum Beispiel bei der Polizei.", "Er hat viel mehr Riechzellen als ein Mensch.", "Mit seiner Nase findet er Spuren und vermisste Menschen."],
    Ohrentier: ["Er hört sehr hohe Töne, auch sehr leise, die wir Menschen nicht mehr hören.", "Sein Hörsinn ist sehr empfindlich.", "Er kann seine Ohren bewegen und damit Geräusche genau orten.", "Er hört eine Hundepfeife, die wir nicht hören."],
    Zehengänger: ["Er tritt nur mit den Zehen auf und nicht mit der ganzen Fußsohle.", "Er ist ein sehr schneller und ausdauernder Läufer.", "Im Gegensatz zum Menschen setzt er die Ferse beim Gehen nicht auf.", "Beim Laufen berühren nur die Zehenspitzen den Boden."],
    Hetzjäger: ["Er jagt zum Beispiel Hasen lange und ausdauernd in großen Sprüngen.", "Er verfolgt seine Beute so lange, bis sie müde ist.", "Wie der Wolf jagt er in einer langen Verfolgungsjagd.", "Er gehört zu den Landraubtieren und jagt mit Ausdauer."],
  };
  const STIMMT = [
    ["Der Hund ist ein Säugetier.", true], ["Der Hund ist das älteste Haustier des Menschen.", true],
    ["Für das Aufspüren der Beute sind die Augen das wichtigste Sinnesorgan des Hundes.", false], ["Ein Hund hat viel mehr Riechzellen als ein Mensch.", true],
    ["Hundeohren sind steif und können sich nicht bewegen.", false], ["Hunde können hohe Töne besser hören als Menschen.", true],
    ["Der Hund tritt beim Gehen mit der ganzen Fußsohle auf.", false], ["Der Hund ist ein Hetzjäger.", true],
    ["Hunde gehören zu den Landraubtieren.", true], ["Die Eckzähne des Hundes heißen Fangzähne.", true],
    ["Der Hund hat ein Pflanzenfressergebiss.", false], ["Hundewelpen trinken Milch bei ihrer Mutter.", true],
    ["Der Hund ist ein Reptil.", false], ["Der Hund stammt vom Wolf ab.", true], ["Der Hund hat kein Skelett.", false],
    ["Ein Hund kann seine Beute nur ganz kurz verfolgen.", false],
  ];
  const LUECKEN = [
    ["Der Hund hat ein ___.", ["Raubtiergebiss"], "Raubtiergebiss, Pflanzenfressergebiss, Milchgebiss"],
    ["Die langen, dolchartigen Eckzähne heißen ___.", ["Fangzähne", "Fangzahn"], "Fangzähne, Mahlzähne, Milchzähne"],
    ["Im Ober- und Unterkiefer gibt es je einen besonders großen, gezackten ___.", ["Reißzahn", "Reisszahn"], "Reißzahn, Schneidezahn, Milchzahn"],
    ["Die kleinen Schneidezähne zupfen ___ von Knochen ab.", ["Fleischreste"], "Fleischreste, Haare, Steine"],
    ["Der Hund ist ein ___, er hat eine sehr feine Spürnase.", ["Nasentier"], "Nasentier, Ohrentier, Augentier"],
    ["Der Hund ist ein ___, weil er nur mit den Zehen auftritt.", ["Zehengänger"], "Zehengänger, Sohlengänger, Hetzjäger"],
    ["Der Hund ist ein ___, weil er seine Beute lange verfolgt.", ["Hetzjäger"], "Hetzjäger, Schleichjäger, Nasentier"],
    ["Der Hund gehört zur Gruppe der ___.", ["Landraubtiere", "Landraubtier"], "Landraubtiere, Pflanzenfresser, Wassertiere"],
    ["Hunde sind ___, weil sie ihre Jungen mit Milch säugen.", ["Säugetiere", "Säugetier"], "Säugetiere, Reptilien, Vögel"],
    ["Ein Hund hört ___ Töne besser als ein Mensch.", ["hohe"], "hohe, tiefe, laute"],
    ["Der Hund ist das älteste ___ des Menschen.", ["Haustier"], "Haustier, Nutztier, Wildtier"],
    ["Der Hund ist ein ___, er hört sehr hohe Töne, die wir nicht mehr hören.", ["Ohrentier"], "Ohrentier, Nasentier, Zehengänger"],
    ["Mit seiner Spürnase hilft der Hund der Polizei als ___.", ["Spürhund", "Suchhund"], "Spürhund, Schlittenhund, Hütehund"],
  ];

  // ---------- Daten: Skelett und Gebiss ----------
  const SKELETT = [
    ["schaedel", "Schädel", ["Schädel", "Schaedel"]], ["wirbel", "Wirbelsäule", ["Wirbelsäule", "Wirbelsaeule"]], ["schulter", "Schulterblatt", ["Schulterblatt"]],
    ["becken", "Beckenknochen", ["Beckenknochen", "Becken"]], ["rippen", "Rippen", ["Rippen", "Rippe"]], ["oberschenkel", "Oberschenkelknochen", ["Oberschenkelknochen", "Oberschenkel"]],
    ["unterschenkel", "Unterschenkelknochen", ["Unterschenkelknochen", "Unterschenkel"]], ["ferse", "Ferse", ["Ferse", "Fersenbein"]],
    ["mittelfuss", "Mittelfußknochen", ["Mittelfußknochen", "Mittelfuss", "Mittelfussknochen"]], ["zehen", "Zehenknochen", ["Zehenknochen", "Zehen"]],
  ];
  const SKELETT_FAKTEN = [
    ["Welcher Teil des Skeletts schützt Herz und Lunge?", "Rippen", ["Schulterblatt", "Beckenknochen", "Zehenknochen"]],
    ["Welcher Teil des Skeletts schützt das Gehirn?", "Schädel", ["Rippen", "Wirbelsäule", "Beckenknochen"]],
    ["Welcher Teil des Skeletts hält den Körper in der Mitte zusammen und schützt das Rückenmark?", "Wirbelsäule", ["Schädel", "Rippen", "Mittelfußknochen"]],
    ["Welcher Teil verbindet die Hinterbeine mit der Wirbelsäule?", "Beckenknochen", ["Schulterblatt", "Schädel", "Rippen"]],
    ["Auf welchen Knochen geht der Hund beim Laufen?", "Zehenknochen", ["Oberschenkelknochen", "Fersenbein", "Beckenknochen"]],
    ["Warum nennt man den Hund einen Zehengänger?", "Weil er nur mit den Zehen auf den Boden tritt", ["Weil er nur Zehen hat", "Weil er besonders lange Zehen braucht, um zu graben", "Weil er mit der ganzen Fußsohle läuft"]],
    ["Welchen Vorteil hat der Zehengang für den Hund?", "Er kann schnell und ausdauernd laufen", ["Er kann besser klettern", "Er kann besser schwimmen", "Er kann leiser schlafen"]],
    ["Welcher Knochen im Hinterbein liegt zwischen Oberschenkel und Ferse?", "Unterschenkelknochen", ["Schulterblatt", "Rippen", "Zehenknochen"]],
    ["Wozu dient das Skelett?", "Es gibt dem Körper Halt und schützt die Organe", ["Es macht das Tier schwerer", "Es wärmt den Körper", "Es erzeugt die Milch"]],
    ["Wie nennt man das Gelenk am Hinterbein, das nach hinten abgeknickt aussieht?", "Ferse", ["Schulterblatt", "Wirbelsäule", "Rippe"]],
  ];
  const GEBISS = [
    ["schneide", "Schneidezahn", "Fleischreste von Knochen abzupfen", ["Schneidezahn", "Schneidezähne"]],
    ["eck", "Eckzahn (Fangzahn)", "die Beute packen, festhalten und töten", ["Eckzahn", "Fangzahn", "Eckzähne", "Fangzähne"]],
    ["reiss", "Reißzahn", "Fleisch und Beute zerschneiden", ["Reißzahn", "Reisszahn"]],
    ["backen", "Backenzahn", "Knochen und Sehnen zerbeißen", ["Backenzahn", "Backenzähne"]],
  ];

  const GEBISS_FAKTEN = [
    ["Welches Gebiss hat der Hund?", "Raubtiergebiss", ["Pflanzenfressergebiss", "Nagergebiss", "Milchgebiss"]],
    ["Wie heißen die langen, dolchartigen Eckzähne noch?", "Fangzähne", ["Mahlzähne", "Milchzähne", "Nagezähne"]],
    ["Welche Zähne zupfen Fleischreste von Knochen ab?", "Die kleinen Schneidezähne", ["Die Fangzähne", "Der Reißzahn", "Die Eckzähne"]],
    ["Welcher Zahn zerschneidet die Beute?", "Der Reißzahn", ["Der Schneidezahn", "Der Eckzahn", "Das Zahnfleisch"]],
    ["Warum nennt man den Hund einen Fleischfresser?", "Sein Gebiss ist zum Packen, Zerschneiden und Zerbeißen von Fleisch und Knochen gebaut", ["Er mag kein Gemüse", "Er kocht sein Fleisch", "Er hat große Ohren"]],
    ["Wozu braucht der Hund die langen Eckzähne?", "Zum Packen, Festhalten und Töten der Beute", ["Zum Kauen von Gras", "Zum Zupfen von Fleischresten", "Zum Zerreiben von Körnern"]],
    ["Welche Zähne zerbeißen Knochen und Sehnen?", "Die Backenzähne", ["Die Schneidezähne", "Die Fangzähne", "Keine, der Hund schluckt alles ganz"]],
    ["Was unterscheidet das Raubtiergebiss von einem Pflanzenfressergebiss?", "Spitze, scharfe Zähne zum Packen und Zerschneiden statt flacher Mahlzähne", ["Es hat gar keine Zähne", "Es hat nur flache Mahlzähne", "Es hat besonders viele Schneidezähne zum Rupfen von Gras"]],
    ["Welcher Zahn ist besonders groß und gezackt?", "Der Reißzahn", ["Der Schneidezahn", "Der Milchzahn", "Der kleinste Backenzahn"]],
    ["Welche Zähne sitzen ganz vorne im Maul des Hundes?", "Die kleinen Schneidezähne", ["Die Reißzähne", "Die Backenzähne", "Die Fangzähne"]],
    ["Wie nennt man ein Gebiss mit Fangzähnen und Reißzahn?", "Raubtiergebiss", ["Pflanzenfressergebiss", "Nagergebiss", "Allesfressergebiss"]],
  ];

  // ---------- Daten: Hunderassen und Hundearbeit ----------
  const ZWECKE = ["Jagdhund", "Schlittenhund", "Begleithund", "Such- und Rettungshund", "Wachhund", "Hütehund", "Blindenhund", "Polizeihund (Spürhund)"];
  const RASSEN = [
    ["Bernhardiner", "Such- und Rettungshund"], ["Rauhaardackel", "Jagdhund"], ["Sibirian Husky", "Schlittenhund"], ["Boxer", "Wachhund"],
    ["Zwergpudel", "Begleithund"], ["Foxterrier", "Jagdhund"], ["Yorkshireterrier", "Begleithund"], ["Irischer Setter", "Jagdhund"], ["Beagle", "Jagdhund"],
    ["Windhund (Sloughi)", "Jagdhund"], ["Chihuahua", "Begleithund"], ["Alaskan Malamute", "Schlittenhund"],
  ];
  const ARBEIT = [
    ["Jagen", "Jagdhund"], ["Menschen in den Bergen suchen und retten", "Such- und Rettungshund"], ["Schafe hüten", "Hütehund"], ["Blinden im Alltag helfen", "Blindenhund"],
    ["Spuren suchen und der Polizei helfen", "Polizeihund (Spürhund)"], ["Schlitten ziehen", "Schlittenhund"], ["Haus und Hof bewachen", "Wachhund"], ["Dem Menschen Gesellschaft leisten", "Begleithund"],
  ];
  const ZWECK_ALT = { "Such- und Rettungshund": ["Such- und Rettungshund", "Suchhund", "Rettungshund"], "Polizeihund (Spürhund)": ["Polizeihund (Spürhund)", "Polizeihund", "Spürhund", "Spuerhund"], "Hütehund": ["Hütehund", "Schäferhund", "Schaeferhund"] };
  const zweckAccept = (z) => ZWECK_ALT[z] || [z];

  // ---------- Daten: Welpe und Katze ----------
  const HUENDIN = ["Aufreißen der Fruchtblase", "Zerbeißen der Nabelschnur", "Trockenlecken", "Milchbildung"];
  const WELPE = ["Unbeholfenes Kriechen", "Pendeln mit dem Kopf", "Saugen an den Zitzen", "Milchtritt", "Trinken der Milch"];
  const WELPE_FAKTEN = [
    ["Was macht die Hündin direkt nach der Geburt mit der Nabelschnur?", "Sie zerbeißt sie", ["Sie trägt sie weg", "Sie frisst nichts", "Sie lässt sie wachsen"]],
    ["Wozu leckt die Hündin die Welpen trocken?", "Das wärmt die Welpen und regt Atmung und Kreislauf an", ["Damit sie schneller wachsen", "Damit sie nicht schreien", "Damit sie Fell bekommen"]],
    ["Was bedeutet „Milchtritt“?", "Der Welpe tritt mit den Vorderpfoten gegen den Bauch der Mutter, damit die Milch fließt", ["Die Mutter tritt den Welpen weg", "Die Welpen treten sich gegenseitig", "Der Welpe tritt in die Milchschüssel"]],
    ["Was bedeutet „Pendeln mit dem Kopf“?", "Der Welpe sucht pendelnd mit dem Kopf die Zitze der Mutter", ["Der Welpe schüttelt sich trocken", "Der Welpe schläft ein", "Der Welpe bellt"]],
    ["Wie ernähren sich neugeborene Welpen?", "Von der Milch ihrer Mutter", ["Von Fleisch", "Von Knochen", "Von Gras"]],
    ["Warum zählt der Hund zu den Säugetieren?", "Weil die Mutter ihre Jungen mit Milch säugt", ["Weil er Fell hat und bellt", "Weil er Eier legt", "Weil er an Land lebt"]],
    ["Was ist das erste, das bei der Hündin nach der Geburt passiert?", "Aufreißen der Fruchtblase", ["Milchbildung", "Saugen an den Zitzen", "Trinken der Milch"]],
    ["Was passiert bei der Hündin, wenn die Welpen saugen und treten?", "Die Milchbildung kommt in Gang", ["Die Hündin schläft sofort ein", "Die Hündin frisst die Nabelschnur", "Die Welpen bekommen Zähne"]],
  ];
  const KATZE_FAKTEN = [
    ["Wie jagt die Katze?", "Sie schleicht sich an die Beute an und springt kurz", ["Sie verfolgt die Beute stundenlang", "Sie jagt im Rudel über weite Strecken", "Sie wartet, bis die Beute müde ist"]],
    ["Was ist die „Geheimwaffe“ der Katzen?", "Einziehbare Krallen", ["Ein sehr langer Schwanz", "Besonders große Ohren", "Besonders lange Zehen"]],
    ["Wozu dienen die Tasthaare (Schnurrhaare) der Katze?", "Zum Tasten und Orientieren, besonders im Dunkeln", ["Zum Hören", "Zum Riechen", "Nur als Schmuck"]],
    ["Warum leuchten Katzenaugen im Dunkeln?", "Eine Schicht im Auge wirft das Licht zurück, so wird jeder Lichtstrahl doppelt genutzt", ["Weil Katzen kleine Lampen im Kopf haben", "Weil sie Licht speichern und abgeben", "Weil ihre Pupillen immer ganz klein sind"]],
    ["Wann sieht eine Katze besonders gut?", "In der Dämmerung und in der Nacht", ["Nur mittags im grellen Licht", "Nur bei Schnee", "Nur mit geschlossenen Augen"]],
    ["Warum können Katzen so leise anschleichen?", "Sie gehen auf weichen Pfoten und haben die Krallen eingezogen", ["Sie haben keine Knochen", "Sie schweben über dem Boden", "Sie gehen auf der ganzen Fußsohle"]],
    ["Welche Aufgabe hatten Katzen früher bei den Menschen?", "Sie schützten die Getreidevorräte vor Mäusen und Ratten", ["Sie zogen Schlitten", "Sie hüteten Schafe", "Sie bewachten das Haus"]],
    ["Zu welcher Gruppe gehört die Katze?", "Zu den Landraubtieren (Säugetiere)", ["Zu den Pflanzenfressern", "Zu den Reptilien", "Zu den Vögeln"]],
    ["Wie läuft die Katze?", "Als Zehengänger", ["Als Sohlengänger", "Als Hüpfer auf den Fersen", "Als Kriecher auf dem Bauch"]],
    ["Welche Tiere jagt die Katze vor allem?", "Kleintiere wie Mäuse", ["Hirsche", "Schafe", "Fische im Meer"]],
  ];
  const KATZE_STIMMT = [
    ["Katzen können sehr gut in der Dämmerung und in der Nacht sehen.", true], ["Katzen haben einziehbare Krallen.", true], ["Katzen jagen wie Hunde als Hetzjäger.", false],
    ["Die Katze ist ein Schleichjäger.", true], ["Katzenohren sind unbeweglich.", false], ["Katzen hören hohe Töne besser als Menschen.", true],
    ["Beim Katzenauge wird jeder Lichtstrahl doppelt ausgenutzt.", true], ["Katzen haben ein Pflanzenfressergebiss.", false],
    ["Die Krallen der Katze sind beim Gehen immer ausgefahren.", false], ["Die Katze setzt beim Gehen die ganze Fußsohle auf.", false],
    ["Katzen gehören zu den Säugetieren.", true], ["Die Tasthaare der Katze sind nur Schmuck und haben keine Aufgabe.", false],
    ["Die Katze greift ihre Beute nach einem kurzen, schnellen Sprung an.", true],
  ];
  // Hund, Katze oder beide?
  const VERGLEICH = [
    ["Er ist ein Hetzjäger.", "Hund"], ["Sie ist ein Schleichjäger.", "Katze"], ["Es ist ein Säugetier.", "beide"], ["Es ist ein Zehengänger.", "beide"],
    ["Die Krallen sind immer ausgefahren und nicht einziehbar.", "Hund"], ["Die Krallen lassen sich einziehen.", "Katze"], ["Es hat ein Raubtiergebiss mit Reißzahn.", "beide"],
    ["Es verfolgt seine Beute lange und ausdauernd.", "Hund"], ["Es schleicht sich an und springt kurz.", "Katze"], ["Die Jungen trinken Muttermilch.", "beide"],
    ["Es ist ein Haustier des Menschen.", "beide"], ["Es ist ein Landraubtier.", "beide"],
  ];

  // ---------- Zeichnungen ----------
  const RED = "#e0364d", LINE = "#7a6a58", BONE = "#f4ead6", PINK = "#f3b3bb";
  // Hundeskelett von der Seite (Kopf rechts), ein Teil rot markiert
  function skelettSvg(hl) {
    const g = (k, body) => `<g data-teil="${k}" fill="${hl === k ? PINK : BONE}" stroke="${hl === k ? RED : LINE}" stroke-width="${hl === k ? 3.4 : 1.8}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
    const spine = hl === "wirbel" ? RED : LINE;
    const front = `<g fill="#ebe3d3" stroke="#a39682" stroke-width="1.6" stroke-linejoin="round"><path d="M214 100 L230 100 L228 142 L218 142Z"/><path d="M218 142 L228 142 L231 184 L223 184Z"/><path d="M222 184 L232 184 L234 202 L226 202Z"/><path d="M225 202 L250 203 L250 209 L223 209Z"/></g>`;
    return `<svg class="nwfig skel" viewBox="0 0 320 214" role="img" aria-label="Skelett eines Hundes, ein Teil ist rot markiert"><line x1="10" y1="211" x2="310" y2="211" stroke="#b9c6d2" stroke-width="2"/>${front}`
      + g("rippen", `<path d="M140 66 Q132 100 150 122 Q175 130 200 114 Q206 90 196 66 Z"/><path d="M152 68 Q146 100 160 122 M166 68 Q160 102 172 126 M180 68 Q176 102 184 126 M194 70 Q192 100 196 118" fill="none"/>`)
      + g("schulter", `<path d="M212 66 L238 72 L230 110 L208 102 Z"/>`)
      + g("becken", `<path d="M82 66 L110 62 L116 98 L92 106 Q80 90 82 66 Z"/>`)
      + g("oberschenkel", `<path d="M96 98 L124 142 L114 150 L88 108 Z"/>`)
      + g("unterschenkel", `<path d="M124 142 L96 172 L84 164 L112 134 Z"/>`)
      + g("ferse", `<path d="M96 174 L82 154 L72 160 L86 184 Z"/>`)
      + g("mittelfuss", `<path d="M86 178 L102 178 L106 202 L94 202 Z"/>`)
      + g("zehen", `<path d="M94 202 L124 203 L124 209 L92 209 Z"/><path d="M104 203 V209 M114 203 V209" fill="none"/>`)
      + `<g data-teil="wirbel" fill="none" stroke="${hl === "wirbel" ? RED : LINE}" stroke-linecap="round"><path d="M250 72 Q205 50 150 60 Q110 66 88 70 Q60 72 40 100" stroke="${spine}" stroke-width="${hl === "wirbel" ? 11 : 9}"/><path d="M250 72 Q205 50 150 60 Q110 66 88 70 Q60 72 40 100" stroke="${hl === "wirbel" ? PINK : BONE}" stroke-width="5" stroke-dasharray="5 3"/></g>`
      + g("schaedel", `<path d="M258 50 Q284 40 304 58 L314 74 Q314 86 298 88 L272 90 Q254 86 254 68 Z"/><path d="M272 90 Q296 102 312 82" fill="none"/><circle cx="280" cy="60" r="3.2" fill="${hl === "schaedel" ? RED : LINE}"/>`)
      + `</svg>`;
  }
  // Gebiss des Hundes von der Seite (Schnauze links), Zähne einer Art rot markiert
  function gebissSvg(hl) {
    const c = (k) => (hl === k ? PINK : "#fffdf8"), s = (k) => (hl === k ? RED : "#8a7a6a"), w = (k) => (hl === k ? 2.6 : 1.4);
    const tooth = (k, d) => `<path d="${d}" fill="${c(k)}" stroke="${s(k)}" stroke-width="${w(k)}" stroke-linejoin="round" data-teil="${k}"/>`;
    const up = (x0, n, step, h) => Array.from({ length: n }, (_, i) => `M${x0 + i * step} 70 L${x0 + i * step + step / 2} ${70 + h} L${x0 + (i + 1) * step} 70 Z`);
    const lo = (x0, n, step, h) => Array.from({ length: n }, (_, i) => `M${x0 + i * step} 100 L${x0 + i * step + step / 2} ${100 - h} L${x0 + (i + 1) * step} 100 Z`);
    let t = "";
    for (const d of up(30, 5, 9, 12).concat(lo(32, 5, 9, 10))) t += tooth("schneide", d);
    t += tooth("eck", "M76 70 L86 104 L96 70 Z") + tooth("eck", "M102 100 L111 68 L120 100 Z");
    for (const d of up(130, 3, 13, 14).concat(lo(132, 3, 13, 13))) t += tooth("backen", d);
    t += tooth("reiss", "M172 70 L178 100 L187 82 L196 102 L204 70 Z") + tooth("reiss", "M190 100 L196 72 L204 88 L213 70 L220 100 Z");
    for (const d of up(232, 3, 13, 12).concat(lo(234, 3, 13, 11))) t += tooth("backen", d);
    return `<svg class="nwfig gebiss" viewBox="0 0 320 170" role="img" aria-label="Gebiss eines Hundes, die Zähne einer Art sind rot markiert">`
      + `<path d="M18 74 Q18 38 58 34 L262 34 Q300 38 304 60 L304 70 L18 70 Z" fill="#f3d9c9" stroke="#8a6a5a" stroke-width="2"/>`
      + `<path d="M24 100 L304 100 L298 132 Q276 152 232 148 L58 134 Q24 128 24 100 Z" fill="#f3d9c9" stroke="#8a6a5a" stroke-width="2"/>` + t + `</svg>`;
  }

  // ---------- Generatoren: Der Hund ----------
  gen("bio.typ", "hund", "Nasentier, Ohrentier, Zehengänger oder Hetzjäger?", (r, lvl) => {
    const typ = r.pick(TYPEN), s = r.pick(TYP_AUSSAGEN[typ]);
    const hints = ["Nasentier = riecht, Ohrentier = hört, Zehengänger = läuft auf den Zehen, Hetzjäger = verfolgt die Beute lange.", "Denk an die vier Überschriften in deinem Heft: Der Hund ist ein …"];
    if (lvl === 3) return textTask({ q: `Welche Beschreibung passt: „Der Hund ist ein …“?<br><span class="nwsatz">${s}</span>`, accept: [typ], hints, solution: typ });
    const o = opts(r, typ, TYPEN, 4);
    return choiceTask(Object.assign({ q: `Der Hund ist ein … <br><span class="nwsatz">${s}</span>`, hints, solution: typ }, o));
  });
  gen("bio.stimmt", "hund", "Stimmt das?", (r) => {
    const [s, ok] = r.pick(STIMMT);
    return choiceTask({ q: `Stimmt die Aussage? <span class="nwsatz">${s}</span>`, options: ["stimmt", "stimmt nicht"], correct: ok ? 0 : 1, hints: ["Denk an deine Heftseiten und das Arbeitsblatt zum Hund.", ok ? "Diese Aussage steht so im Heft." : "Tipp: Hier ist etwas verdreht. Was müsste richtig heißen?"], solution: ok ? "stimmt" : "stimmt nicht" });
  });
  gen("bio.luecke", "hund", "Lückentext", (r, lvl) => {
    const [s, ans, box] = r.pick(LUECKEN);
    return textTask({ q: `Ergänze: <span class="nwsatz">${s.replace("___", '<span class="kbx">?</span>')}</span>${lvl === 1 ? `<br><small>Wortkasten: ${box}</small>` : ""}`, accept: ans, hints: [`Wortkasten: ${box}`, "Das Wort beginnt mit " + ans[0][0].toUpperCase() + "."], solution: ans[0] });
  });

  // ---------- Generatoren: Skelett ----------
  gen("bio.skelett.bild", "skelett", "Hundeskelett beschriften", (r, lvl) => {
    const pool = lvl === 1 ? SKELETT.slice(0, 5) : SKELETT, [k, name, acc] = r.pick(pool);
    const hints = ["Schau, wo der Teil am Hund liegt: vorne der Schädel, oben die Wirbelsäule, in der Mitte die Rippen, hinten das Becken und das Hinterbein.", "Das Hinterbein von oben nach unten: Oberschenkel, Unterschenkel, Ferse, Mittelfuß, Zehen."];
    const q = `<div class="nwfigw">${skelettSvg(k)}</div>Wie heißt der <b>rot markierte</b> Teil des Hundeskeletts?`;
    if (lvl === 3) return textTask({ q, accept: acc, hints, solution: name });
    const o = opts(r, name, pool.map((x) => x[1]));
    return choiceTask(Object.assign({ q, hints, solution: name }, o));
  });
  gen("bio.skelett.fakt", "skelett", "Skelett: Fragen", (r) => {
    const [q, right, wrong] = r.pick(SKELETT_FAKTEN);
    const o = opts(r, right, [right].concat(wrong));
    return choiceTask(Object.assign({ q, hints: ["Denk an dein Arbeitsblatt „Der Hund“ und an das Skelett.", "Zehengänger: Der Hund tritt nur mit den Zehen auf."], solution: right }, o));
  });

  // ---------- Generatoren: Gebiss ----------
  gen("bio.gebiss.bild", "gebiss", "Raubtiergebiss beschriften", (r, lvl) => {
    const pool = lvl === 1 ? GEBISS.slice(0, 3) : GEBISS, [k, name, , acc] = r.pick(pool);
    const hints = ["Vorne sind die kleinen Schneidezähne, dahinter die langen Fangzähne, dann kommen die Backenzähne und der große gezackte Reißzahn.", "Der Reißzahn ist der größte, gezackte Zahn in Ober- und Unterkiefer."];
    const q = `<div class="nwfigw">${gebissSvg(k)}</div>Wie heißen die <b>rot markierten</b> Zähne?`;
    if (lvl === 3) return textTask({ q, accept: acc, hints, solution: name });
    const o = opts(r, name, pool.map((x) => x[1]));
    return choiceTask(Object.assign({ q, hints, solution: name }, o));
  });
  gen("bio.gebiss.funktion", "gebiss", "Wozu dient welcher Zahn?", (r, lvl) => {
    const [, name, fun, acc] = r.pick(GEBISS);
    const hints = ["Schneidezahn: abzupfen. Eckzahn (Fangzahn): packen und töten. Reißzahn: zerschneiden. Backenzahn: zerbeißen.", "Lies in deinem Heft nach: „Der Hund hat ein Raubtiergebiss“."];
    if (lvl === 3) return textTask({ q: `Welcher Zahn hilft dem Hund dabei: <span class="nwsatz">${fun}</span>?`, accept: acc, hints, solution: name });
    if (r.chance(0.5)) { const o = opts(r, fun, GEBISS.map((x) => x[2])); return choiceTask(Object.assign({ q: `Wozu dient der <b>${name}</b> beim Hund?`, hints, solution: fun }, o)); }
    const o = opts(r, name, GEBISS.map((x) => x[1]));
    return choiceTask(Object.assign({ q: `Welcher Zahn hilft dem Hund dabei: <span class="nwsatz">${fun}</span>?`, hints, solution: name }, o));
  });

  gen("bio.gebiss.fakt", "gebiss", "Raubtiergebiss: Fragen", (r) => {
    const [q, right, wrong] = r.pick(GEBISS_FAKTEN);
    const o = opts(r, right, [right].concat(wrong));
    return choiceTask(Object.assign({ q, hints: ["Lies in deinem Heft nach: „Der Hund hat ein Raubtiergebiss“.", "Schneidezähne zupfen, Eckzähne (Fangzähne) packen, Reißzahn zerschneidet, Backenzähne zerbeißen."], solution: right }, o));
  });

  // ---------- Generatoren: Hunderassen und Hundearbeit ----------
  gen("bio.rassen", "rassen", "Rasse und Verwendungszweck", (r, lvl) => {
    const [rasse, zweck] = r.pick(RASSEN);
    const hints = ["Jagdhunde jagen, Schlittenhunde ziehen Schlitten, Begleithunde sind Gefährten, Wachhunde bewachen.", "Überlege, wofür man diese Rasse früher gezüchtet hat."];
    if (lvl === 3) return textTask({ q: `Wofür wurde der Hund <b>${rasse}</b> gezüchtet? (zum Beispiel: Jagdhund)`, accept: zweckAccept(zweck), hints, solution: zweck });
    const o = opts(r, zweck, ZWECKE.slice(0, lvl === 1 ? 5 : 8).concat(lvl === 1 ? [zweck] : []).filter((x, i, a) => a.indexOf(x) === i), 4);
    return choiceTask(Object.assign({ q: `Wofür wurde der Hund <b>${rasse}</b> gezüchtet?`, hints, solution: zweck }, o));
  });
  gen("bio.arbeit", "rassen", "Der Hund hilft dem Menschen", (r, lvl) => {
    const [tat, hund] = r.pick(ARBEIT);
    const hints = ["Der Name verrät es: Wer jagt, ist ein Jagdhund. Wer Schlitten zieht, ein Schlittenhund …", "Der Hund ist das älteste Haustier des Menschen und hilft ihm bei vielen Aufgaben."];
    if (lvl === 3) return textTask({ q: `Wie nennt man einen Hund, der diese Tätigkeit hat: <span class="nwsatz">${tat}</span>?`, accept: zweckAccept(hund), hints, solution: hund });
    const o = opts(r, hund, ZWECKE, 4);
    return choiceTask(Object.assign({ q: `Wie nennt man einen Hund, der diese Tätigkeit hat: <span class="nwsatz">${tat}</span>?`, hints, solution: hund }, o));
  });

  // ---------- Generatoren: Welpe ----------
  gen("bio.welpe.reihe", "welpe", "Ein Welpe wird geboren: Reihenfolge", (r, lvl) => {
    const hue = r.chance(0.5), chain = hue ? HUENDIN : WELPE, who = hue ? "bei der Hündin" : "beim Welpen";
    const i = r.int(0, chain.length - 2), vor = r.chance(0.5);
    const frage = vor ? `Was passiert ${who} <b>direkt nach</b>: „${chain[i]}“?` : `Was passiert ${who} <b>direkt vor</b>: „${chain[i + 1]}“?`;
    const right = vor ? chain[i + 1] : chain[i];
    const o = opts(r, right, chain, lvl === 1 ? 3 : 4);
    return choiceTask(Object.assign({ q: frage, hints: [hue ? "Bei der Hündin: Fruchtblase aufreißen, Nabelschnur zerbeißen, Trockenlecken, Milchbildung." : "Beim Welpen: Kriechen, Pendeln mit dem Kopf, Saugen an den Zitzen, Milchtritt, Trinken der Milch.", "Denk an dein Arbeitsblatt „Ein Welpe wird geboren“ mit den Kästchen 1 bis 9."], solution: right }, o));
  });
  gen("bio.welpe.fakt", "welpe", "Ein Welpe wird geboren: Fragen", (r) => {
    const [q, right, wrong] = r.pick(WELPE_FAKTEN);
    const o = opts(r, right, [right].concat(wrong));
    return choiceTask(Object.assign({ q, hints: ["Denk an dein Arbeitsblatt „Ein Welpe wird geboren“.", "Hunde sind Säugetiere: Die Mutter säugt ihre Jungen mit Milch."], solution: right }, o));
  });

  // ---------- Generatoren: Katze ----------
  gen("bio.katze.fakt", "katze", "Die Katze: Fragen", (r) => {
    const [q, right, wrong] = r.pick(KATZE_FAKTEN);
    const o = opts(r, right, [right].concat(wrong));
    return choiceTask(Object.assign({ q, hints: ["Denk an dein Arbeitsblatt „Anpassungen der Schleichjäger“.", "Katzen sind Schleichjäger: Sie schleichen sich leise an und springen kurz."], solution: right }, o));
  });
  gen("bio.katze.stimmt", "katze", "Katze: Stimmt das?", (r) => {
    const [s, ok] = r.pick(KATZE_STIMMT);
    return choiceTask({ q: `Stimmt die Aussage? <span class="nwsatz">${s}</span>`, options: ["stimmt", "stimmt nicht"], correct: ok ? 0 : 1, hints: ["Denk an dein Arbeitsblatt zu den Schleichjägern.", ok ? "Diese Aussage stimmt." : "Tipp: Hier ist etwas verdreht. Was müsste richtig heißen?"], solution: ok ? "stimmt" : "stimmt nicht" });
  });
  gen("bio.vergleich", "katze", "Hund und Katze im Vergleich", (r, lvl) => {
    const [s, wer] = r.pick(VERGLEICH), pool = ["Hund", "Katze", "beide"];
    const o = opts(r, wer, pool, 3);
    return choiceTask(Object.assign({ q: `Passt das zum Hund, zur Katze oder zu beiden?<br><span class="nwsatz">${s}</span>`, hints: ["Hund = Hetzjäger, Katze = Schleichjäger. Beide sind Säugetiere, Zehengänger und Landraubtiere.", lvl === 1 ? "Der Hund hat Krallen, die immer draußen sind. Bei der Katze kann man sie einziehen." : "Überlege, was beide gemeinsam haben."], solution: wer === "beide" ? "beide" : wer }, o));
  });

  // ---------- Themen ----------
  const BIOT = [
    { id: "hund", name: "Der Hund – ein Säugetier", icon: "🐕", lern: true, fach: "bio" },
    { id: "skelett", name: "Das Hundeskelett", icon: "🦴", lern: true, fach: "bio" },
    { id: "gebiss", name: "Das Raubtiergebiss", icon: "🦷", lern: true, fach: "bio" },
    { id: "rassen", name: "Hunderassen & Hundearbeit", icon: "🐶", lern: true, fach: "bio" },
    { id: "welpe", name: "Ein Welpe wird geboren", icon: "🍼", lern: true, fach: "bio" },
    { id: "katze", name: "Die Katze – ein Schleichjäger", icon: "🐈", lern: true, fach: "bio" },
  ];
  BIOT.forEach((t) => { t.gens = Object.values(G).filter((g) => g.topic === t.id).map((g) => g.id); TOPICS.push(t); });
  const MERKE = {
    hund: "Der Hund ist ein Säugetier und das älteste Haustier des Menschen. Er ist ein Nasentier (feine Spürnase), ein Ohrentier (hört hohe Töne), ein Zehengänger (läuft nur auf den Zehen, schnell und ausdauernd) und ein Hetzjäger (verfolgt die Beute lange). Er gehört zu den Landraubtieren.",
    skelett: "Hundeskelett: Schädel, Wirbelsäule, Schulterblatt, Rippen, Beckenknochen. Das Hinterbein von oben nach unten: Oberschenkelknochen, Unterschenkelknochen, Ferse, Mittelfußknochen, Zehenknochen. Der Hund tritt nur mit den Zehen auf (Zehengänger).",
    gebiss: "Raubtiergebiss: Die kleinen Schneidezähne zupfen Fleischreste von Knochen ab. Die langen, dolchartigen Eckzähne sind Fangzähne (packen, festhalten, töten). Im Ober- und Unterkiefer gibt es je einen großen, gezackten Reißzahn (zerschneidet die Beute). Die Backenzähne zerbeißen Knochen und Sehnen.",
    rassen: "Es gibt über 400 gezüchtete Hunderassen. Man züchtet sie für Aufgaben: Jagdhund, Schlittenhund, Begleithund, Wachhund, Hütehund, Such- und Rettungshund, Blindenhund, Polizeihund (Spürhund). Der Körperbau passt zur Aufgabe.",
    welpe: "Bei der Hündin: Aufreißen der Fruchtblase, Zerbeißen der Nabelschnur, Trockenlecken, Milchbildung. Beim Welpen: unbeholfenes Kriechen, Pendeln mit dem Kopf, Saugen an den Zitzen, Milchtritt, Trinken der Milch.",
    katze: "Die Katze ist ein Schleichjäger (schleicht sich an und springt kurz), der Hund ein Hetzjäger. Katzen haben einziehbare Krallen (Geheimwaffe), sehen in der Dämmerung und nachts sehr gut (jeder Lichtstrahl wird doppelt genutzt), haben Tasthaare und bewegliche Ohren. Früher schützten sie die Getreidevorräte.",
  };

  // ---------- Probearbeit Biologie ----------
  function probearbeit(seed) {
    const r = R(seed), s = () => r.int(1, 2 ** 31 - 1);
    const mk = (g, l) => A.make(g, l, s());
    const parts = [
      ["Der Hund – ein Säugetier", [["bio.typ", 2], ["bio.typ", 3], ["bio.stimmt", 1], ["bio.stimmt", 1], ["bio.luecke", 2]]],
      ["Skelett und Gebiss", [["bio.skelett.bild", 2], ["bio.skelett.bild", 3], ["bio.gebiss.bild", 2], ["bio.gebiss.bild", 3], ["bio.gebiss.funktion", 2]]],
      ["Hunderassen und Hundearbeit", [["bio.rassen", 2], ["bio.rassen", 3], ["bio.arbeit", 2], ["bio.arbeit", 3]]],
      ["Ein Welpe wird geboren", [["bio.welpe.reihe", 2], ["bio.welpe.reihe", 2], ["bio.welpe.fakt", 2], ["bio.welpe.fakt", 2]]],
      ["Die Katze – ein Schleichjäger", [["bio.katze.fakt", 2], ["bio.katze.stimmt", 1], ["bio.katze.stimmt", 1], ["bio.vergleich", 2], ["bio.vergleich", 2]]],
    ];
    return parts.map(([title, ts], i) => ({ nr: i + 1, title, tasks: ts.map(([g, l]) => { const t = mk(g, l); if (t.kind === "text") t.pts = Math.max(t.pts, 2); return t; }) }));
  }

  const api = { TYPEN, TYP_AUSSAGEN, STIMMT, LUECKEN, SKELETT, SKELETT_FAKTEN, GEBISS, GEBISS_FAKTEN, ZWECKE, RASSEN, ARBEIT, HUENDIN, WELPE, WELPE_FAKTEN, KATZE_FAKTEN, KATZE_STIMMT, VERGLEICH, MERKE, norm, skelettSvg, gebissSvg, probearbeit };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BIO = api;
})(typeof self !== "undefined" ? self : this);
