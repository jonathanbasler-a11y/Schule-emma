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
  const numTask = (o) => T(Object.assign({ kind: "num", check: (s) => ({ ok: A.parseNum(s) === o.ans }), answer: String(o.ans) }, o));
  const gen = (id, topic, name, f, o) => { G[id] = Object.assign({ id, topic, name, f, lvls: [1, 2, 3] }, o || {}); };
  function opts(r, right, pool, n) {
    const others = r.shuffle(pool.filter((x) => x !== right)).slice(0, (n || 4) - 1);
    const all = r.shuffle([right].concat(others));
    return { options: all, correct: all.indexOf(right) };
  }

  // ---------- Daten: Der Hund ----------
  const TYPEN = ["Nasentier", "Ohrentier", "Zehengänger", "Hetzjäger"];
  const TYP_AUSSAGEN = {
    Nasentier: ["Er hat eine sehr feine, empfindliche Spürnase.", "Er hilft dem Menschen als Spür- oder Suchhund, zum Beispiel bei der Polizei.", "Er hat viel mehr Riechzellen als ein Mensch.", "Mit seiner Nase findet er Spuren und vermisste Menschen.", "Er nutzt die Schnüffelatmung, um Gerüche aufzunehmen."],
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
    ["Der Hund ist ein Wirbeltier.", true], ["Der Mensch ist wie der Hund ein Zehengänger.", false], ["Der Mensch ist ein Sohlengänger.", true],
    ["Ein Hund wird meistens 10 bis 15 Jahre alt.", true], ["Hunde sind gleichwarm, ihre Körpertemperatur liegt zwischen 38 und 39 Grad.", true],
    ["Der Hund kann nur an den Pfoten schwitzen und kühlt sich durch Hecheln ab.", true], ["Hunde schwitzen am ganzen Körper wie wir Menschen.", false],
    ["Der Hund kann mit seinem Hörsinn auch sehr hohe Töne wahrnehmen.", true], ["Der Hund sieht besser als der Mensch und braucht die Nase kaum.", false],
    ["Der Hund hat ein Pflanzenfressergebiss mit flachen Mahlzähnen.", false], ["Der Hund ist ein Sohlengänger wie der Mensch.", false], ["Das Skelett des Hundes hat keine Wirbelsäule.", false],
    ["Das Fell des Hundes besteht aus längeren Deckhaaren und kurzen Wollhaaren.", true], ["Das Fell schützt den Hund gut vor Kälte.", true],
    ["Ein Hund erkennt an Körperhaltung, Körpergeruch und Gesichtsausdruck, ob sich ein Mensch freut oder traurig ist.", true],
    ["Manche Hunde können Krankheiten beim Menschen erriechen, wenn sie darauf trainiert wurden.", true], ["Hunde können sich überhaupt nicht in Menschen einfühlen.", false],
    ["Vorder- und Hinterbeine sind über Schulterblätter und Beckenknochen mit dem Rumpfskelett verbunden.", true],
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
    ["Der Hund hat ein Skelett aus Knochen, deshalb ist er ein ___.", ["Wirbeltier"], "Wirbeltier, Weichtier, Insekt"],
    ["Der Mensch tritt mit der ganzen Fußsohle auf, er ist ein ___.", ["Sohlengänger"], "Sohlengänger, Zehengänger, Hetzjäger"],
    ["Hunde sind ___, ihre Körpertemperatur bleibt gleich.", ["gleichwarm"], "gleichwarm, wechselwarm, kaltblütig"],
    ["Das Fell des Hundes besteht aus längeren ___ und kurzen Wollhaaren.", ["Deckhaaren", "Deckhaare"], "Deckhaaren, Schnurrhaaren, Stachelhaaren"],
    ["Bei Hitze hängt der Hund die Zunge heraus und ___.", ["hechelt"], "hechelt, schwitzt, friert"],
    ["Der Hund ist ein ___, er hört sehr hohe Töne, die wir nicht mehr hören.", ["Ohrentier"], "Ohrentier, Nasentier, Zehengänger"],
    ["Mit seiner Spürnase hilft der Hund der Polizei als ___.", ["Spürhund", "Suchhund"], "Spürhund, Schlittenhund, Hütehund"],
  ];

  // ---------- Daten: Skelett und Gebiss ----------
  const SKELETT = [
    ["schaedel", "Schädel", ["Schädel", "Schaedel"]], ["wirbel", "Wirbelsäule", ["Wirbelsäule", "Wirbelsaeule"]], ["schulter", "Schulterblatt", ["Schulterblatt"]],
    ["becken", "Beckenknochen", ["Beckenknochen", "Becken"]], ["rippen", "Rippen", ["Rippen", "Rippe"]], ["oberschenkel", "Oberschenkelknochen", ["Oberschenkelknochen", "Oberschenkel"]],
    ["unterschenkel", "Unterschenkelknochen", ["Unterschenkelknochen", "Unterschenkel"]], ["ferse", "Fersenknochen", ["Fersenknochen", "Ferse", "Fersenbein"]],
    ["mittelfuss", "Mittelfußknochen", ["Mittelfußknochen", "Mittelfuss", "Mittelfussknochen"]], ["zehen", "Zehenknochen", ["Zehenknochen", "Zehen"]],
    ["knie", "Kniegelenk", ["Kniegelenk", "Knie"]], ["oberarm", "Oberarmknochen", ["Oberarmknochen", "Oberarm"]],
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
    ["Wie nennt man den Knochen am Hinterbein, der nach hinten absteht und beim Hund nicht den Boden berührt?", "Fersenknochen", ["Schulterblatt", "Wirbelsäule", "Rippe"]],
    ["Aus welchen zwei Knochen besteht der Unterschenkel?", "Schienbein und Wadenbein", ["Schulterblatt und Beckenknochen", "Oberschenkel und Fersenbein", "Rippe und Wirbel"]],
    ["Welches Gelenk verbindet Oberschenkelknochen und Unterschenkelknochen?", "Das Kniegelenk", ["Das Schulterblatt", "Der Fersenknochen", "Die Wirbelsäule"]],
    ["Womit sind die Vorder- und Hinterbeine am Rumpfskelett befestigt?", "Über Schulterblätter und Beckenknochen", ["Über die Rippen", "Über den Schädel", "Über die Zehenknochen"]],
    ["Welche Knochen berühren beim Hund den Boden?", "Nur die Zehenknochen", ["Fersen- und Fußwurzelknochen", "Die ganzen Mittelfußknochen", "Der Unterschenkel"]],
    ["Wie nennt man den Gang des Menschen im Gegensatz zum Hund?", "Sohlengänger", ["Zehengänger", "Hetzjäger", "Nasentier"]],
    ["Was ist der Hund, weil er eine Wirbelsäule hat?", "Ein Wirbeltier", ["Ein Wirbelwind", "Ein Weichtier", "Ein Insekt"]],
    ["Wie heißen die Knochen im Fuß des Hundes von der Ferse bis zu den Zehen?", "Fersenknochen, Fußwurzelknochen, Mittelfußknochen, Zehenknochen", ["Schienbein, Wadenbein, Oberschenkel, Zehen", "Schulterblatt, Rippen, Becken, Wirbel", "Oberarm, Knie, Ferse, Schädel"]],
  ];
  const GEBISS = [
    ["schneide", "Schneidezahn", "Fleischreste von Knochen abzupfen", ["Schneidezahn", "Schneidezähne"]],
    ["eck", "Eckzahn (Fangzahn)", "die Beute packen, festhalten und töten", ["Eckzahn", "Fangzahn", "Eckzähne", "Fangzähne"]],
    ["reiss", "Reißzahn", "Fleisch und Beute zerschneiden", ["Reißzahn", "Reisszahn"]],
    ["backen", "Backenzahn", "die Nahrung zerkleinern und Knochen zerbeißen", ["Backenzahn", "Backenzähne"]],
  ];

  const GEBISS_FAKTEN = [
    ["Welches Gebiss hat der Hund?", "Raubtiergebiss", ["Pflanzenfressergebiss", "Nagergebiss", "Milchgebiss"]],
    ["Wie heißen die langen, dolchartigen Eckzähne noch?", "Fangzähne", ["Mahlzähne", "Milchzähne", "Nagezähne"]],
    ["Welche Zähne zupfen Fleischreste von Knochen ab?", "Die kleinen Schneidezähne", ["Die Fangzähne", "Der Reißzahn", "Die Eckzähne"]],
    ["Welcher Zahn zerschneidet die Beute?", "Der Reißzahn", ["Der Schneidezahn", "Der Eckzahn", "Das Zahnfleisch"]],
    ["Warum nennt man den Hund einen Fleischfresser?", "Sein Gebiss ist zum Packen, Zerschneiden und Zerbeißen von Fleisch und Knochen gebaut", ["Er mag kein Gemüse", "Er kocht sein Fleisch", "Er hat große Ohren"]],
    ["Wozu braucht der Hund die langen Eckzähne?", "Zum Packen, Festhalten und Töten der Beute", ["Zum Kauen von Gras", "Zum Zupfen von Fleischresten", "Zum Zerreiben von Körnern"]],
    ["Welche Zähne zerkleinern hinten im Maul die Nahrung?", "Die Backenzähne", ["Die Schneidezähne", "Die Fangzähne", "Keine, der Hund schluckt alles ganz"]],
    ["Wie heißen die jeweils zwei größten, kräftigsten und schärfsten Backenzähne im Ober- und im Unterkiefer?", "Reißzähne", ["Fangzähne", "Schneidezähne", "Milchzähne"]],
    ["Wofür nutzt der Hund die kleinen Schneidezähne?", "Zur Fellpflege und zum Abschaben der Fleischreste von Knochen", ["Zum Töten der Beute", "Zum Zerschneiden großer Fleischstücke", "Zum Mahlen von Körnern"]],
    ["Wie nennt man es, dass der Bau der Zähne zu ihrer Aufgabe passt?", "Angepasstheit", ["Zahnformel", "Züchtung", "Rangordnung"]],
    ["Was fasst die Zahnformel zusammen?", "Die Anordnung und Anzahl der Zähne", ["Das Alter des Hundes", "Die Rasse des Hundes", "Die Größe des Hundes"]],
    ["Was unterscheidet das Raubtiergebiss von einem Pflanzenfressergebiss?", "Spitze, scharfe Zähne zum Packen und Zerschneiden statt flacher Mahlzähne", ["Es hat gar keine Zähne", "Es hat nur flache Mahlzähne", "Es hat besonders viele Schneidezähne zum Rupfen von Gras"]],
    ["Welcher Zahn ist besonders groß und gezackt?", "Der Reißzahn", ["Der Schneidezahn", "Der Milchzahn", "Der kleinste Backenzahn"]],
    ["Welche Zähne sitzen ganz vorne im Maul des Hundes?", "Die kleinen Schneidezähne", ["Die Reißzähne", "Die Backenzähne", "Die Fangzähne"]],
    ["Wie nennt man ein Gebiss mit Fangzähnen und Reißzahn?", "Raubtiergebiss", ["Pflanzenfressergebiss", "Nagergebiss", "Allesfressergebiss"]],
  ];

  // Zahnformel aus dem Buch (rechts und links gleich): Backenzähne, Eckzahn, Schneidezähne (3+3), Eckzahn, Backenzähne
  const ZAHNFORMEL = { Oberkiefer: [6, 1, 3, 3, 1, 6], Unterkiefer: [7, 1, 3, 3, 1, 7] };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const ZAHL_FRAGEN = [
    ["Wie viele <b>Schneidezähne</b> hat der Hund im Oberkiefer?", ZAHNFORMEL.Oberkiefer[2] + ZAHNFORMEL.Oberkiefer[3], "Die Zahnformel zeigt in der Mitte 3 und 3."],
    ["Wie viele <b>Schneidezähne</b> hat der Hund im Unterkiefer?", ZAHNFORMEL.Unterkiefer[2] + ZAHNFORMEL.Unterkiefer[3], "Die Zahnformel zeigt in der Mitte 3 und 3."],
    ["Wie viele <b>Eckzähne (Fangzähne)</b> hat der Hund im Oberkiefer?", ZAHNFORMEL.Oberkiefer[1] + ZAHNFORMEL.Oberkiefer[4], "Einer auf jeder Seite: 1 und 1."],
    ["Wie viele <b>Eckzähne (Fangzähne)</b> hat der Hund im Unterkiefer?", ZAHNFORMEL.Unterkiefer[1] + ZAHNFORMEL.Unterkiefer[4], "Einer auf jeder Seite: 1 und 1."],
    ["Wie viele <b>Backenzähne</b> hat der Hund im Oberkiefer insgesamt?", ZAHNFORMEL.Oberkiefer[0] + ZAHNFORMEL.Oberkiefer[5], "Rechne die Zahlen außen zusammen: 6 + 6."],
    ["Wie viele <b>Backenzähne</b> hat der Hund im Unterkiefer insgesamt?", ZAHNFORMEL.Unterkiefer[0] + ZAHNFORMEL.Unterkiefer[5], "Rechne die Zahlen außen zusammen: 7 + 7."],
    ["Wie viele Zähne hat der Hund im <b>Oberkiefer</b> insgesamt?", sum(ZAHNFORMEL.Oberkiefer), "Zähle alle Zahlen der oberen Zeile zusammen."],
    ["Wie viele Zähne hat der Hund im <b>Unterkiefer</b> insgesamt?", sum(ZAHNFORMEL.Unterkiefer), "Zähle alle Zahlen der unteren Zeile zusammen."],
    ["Wie viele Zähne hat ein Hund <b>insgesamt</b> (Oberkiefer und Unterkiefer)?", sum(ZAHNFORMEL.Oberkiefer) + sum(ZAHNFORMEL.Unterkiefer), "Oberkiefer plus Unterkiefer."],
    ["Wie viele <b>Reißzähne</b> hat der Hund insgesamt? (je zwei im Ober- und im Unterkiefer)", 4, "2 im Oberkiefer und 2 im Unterkiefer."],
  ];

  // ---------- Daten: Hunderassen und Hundearbeit ----------
  const ZWECKE = ["Jagdhund", "Schlittenhund", "Begleithund", "Such- und Rettungshund", "Wachhund", "Hütehund", "Blindenhund", "Polizeihund (Spürhund)"];
  const RASSEN = [
    ["Bernhardiner", "Such- und Rettungshund"], ["Rauhaardackel", "Jagdhund"], ["Sibirian Husky", "Schlittenhund"], ["Boxer", "Wachhund"],
    ["Zwergpudel", "Begleithund"], ["Foxterrier", "Jagdhund"], ["Yorkshireterrier", "Begleithund"], ["Irischer Setter", "Jagdhund"], ["Beagle", "Jagdhund"],
    ["Windhund (Sloughi)", "Jagdhund"], ["Deutscher Schäferhund", "Wachhund"], ["Englische Bulldogge", "Wachhund"], ["Chihuahua", "Begleithund"], ["Alaskan Malamute", "Schlittenhund"],
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

  // ---------- Daten: Vom Wolf zum Hund (Buch Seite 24 bis 27) ----------
  const WOLF_FAKTEN = [
    ["Was ist die Stammform aller Haushunde?", "Der Wolf", ["Der Fuchs", "Der Schakal", "Der Luchs"]],
    ["Wie nennt man den Vorgang, bei dem aus einem Wildtier ein Haustier wird?", "Domestizierung", ["Züchtung", "Rudelbildung", "Fortpflanzung"]],
    ["Wie nennt man es, wenn der Mensch gezielt Tiere mit gewünschten Eigenschaften verpaart?", "Züchtung", ["Domestizierung", "Rangordnung", "Drohverhalten"]],
    ["Wie nennt man die vielen verschiedenen Hundearten, die durch Züchtung entstanden sind?", "Rassen", ["Rudel", "Mischlinge", "Arten"]],
    ["Wie nennt man die Nachkommen von Tieren unterschiedlicher Rassen?", "Mischlinge", ["Rassehunde", "Rudel", "Wolfshunde"]],
    ["Zu wie vielen Arten gehören alle Hunde?", "Zu einer Art, sie können sich untereinander fortpflanzen", ["Jede Rasse ist eine eigene Art", "Zu zwei Arten, großen und kleinen Hunden", "Zu keiner Art"]],
    ["Wie nennt man die Familiengruppe der Wölfe?", "Rudel", ["Herde", "Schwarm", "Horde"]],
    ["Wie viele Tiere leben meist in einem Wolfsrudel?", "5 bis 10", ["2 bis 3", "20 bis 30", "mehr als 100"]],
    ["Wer führt ein Wolfsrudel an?", "Ein männliches und ein weibliches Leittier (Leitwolf und Leitwölfin)", ["Das älteste Tier", "Das kleinste Tier", "Jedes Tier abwechselnd"]],
    ["Wie nennt man die strenge Ordnung im Rudel, in der jedes Mitglied seinen Platz hat?", "Rangordnung", ["Rudelbildung", "Zucht", "Drohverhalten"]],
    ["Wer darf im Rudel zuerst fressen?", "Leitwolf und Leitwölfin", ["Die jüngsten Wölfe", "Alle gleichzeitig", "Der schwächste Wolf"]],
    ["Wie nennt man es, wenn ein Wolf Körper und Rute aufrichtet, um größer zu wirken?", "Imponierverhalten", ["Drohverhalten", "Demutsverhalten", "Angstverhalten"]],
    ["Wie nennt man es, wenn ein Wolf die Ohren anlegt, knurrt und die Zähne zeigt?", "Drohverhalten", ["Imponierverhalten", "Demutsverhalten", "Spielverhalten"]],
    ["Wie nennt man es, wenn ein Wolf die Rute einzieht, sich auf den Rücken legt und die Kehle zeigt?", "Demutsverhalten", ["Imponierverhalten", "Drohverhalten", "Jagdverhalten"]],
    ["Was bedeutet „imponieren“?", "Beeindrucken", ["Davonlaufen", "Knurren", "Fressen"]],
    ["Was ist mit „Rute“ bei einem Hund oder Wolf gemeint?", "Der Schwanz", ["Das Ohr", "Das Bein", "Die Schnauze"]],
    ["Was ist ein „Rüde“?", "Ein männlicher Hund", ["Ein weiblicher Hund", "Ein junger Hund", "Ein Wolfsrudel"]],
    ["Wann suchten Wölfe schon die Nähe der Menschen?", "Vor mehr als 30 000 Jahren in der Steinzeit", ["Vor 300 Jahren", "Vor 50 Jahren", "Erst im Mittelalter"]],
    ["Wie alt wird ein Hund meistens?", "10 bis 15 Jahre", ["2 bis 4 Jahre", "30 bis 40 Jahre", "50 Jahre"]],
    ["Wie verständigt sich der Hund mit anderen?", "Durch Körpersprache und Laute", ["Nur durch Bellen", "Nur durch Gerüche", "Gar nicht"]],
    ["Wer im Rudel bekommt Junge?", "Nur Leitwolf und Leitwölfin", ["Alle Weibchen", "Alle Wölfe", "Nur die jüngsten Tiere"]],
    ["Wer bestimmt im Rudel, wann gejagt wird?", "Leitwolf und Leitwölfin", ["Das schwächste Tier", "Die Jungtiere", "Alle abwechselnd"]],
    ["Was taten die Menschen in der Steinzeit mit Wolfsjungen?", "Sie nahmen sie bei sich auf und zähmten sie", ["Sie jagten sie", "Sie ließen sie frei laufen", "Sie verkauften sie"]],
    ["Wobei halfen die gezähmten Wölfe den Menschen wahrscheinlich?", "Beim Aufspüren von Tieren bei der Jagd und als Schutz vor gefährlichen Wildtieren", ["Beim Schlittenziehen", "Beim Ackerbau", "Beim Bau von Häusern"]],
    ["Wie nennt man Nachkommen einer Verpaarung von Wolf und Hund?", "Wolfshunde", ["Rassehunde", "Wildhunde", "Schakale"]],
    ["Was zeigen Wolfshunde meist?", "Mehr Verhaltensweisen des Wolfs als andere Rassen", ["Gar keine Verhaltensweisen des Wolfs", "Nur Verhaltensweisen des Hundes", "Nur Angstverhalten"]],
    ["Welcher Wolf lebt in sehr kalten nördlichen Regionen der Erde?", "Der Polarwolf", ["Der Grauwolf", "Der Wolfshund", "Der Schakal"]],
    ["Welcher Wolf lebt in Wäldern und Graslandschaften Europas und Asiens?", "Der Grauwolf", ["Der Polarwolf", "Der Wolfshund", "Der Fuchs"]],
    ["Welcher Wolf wird bis zu 80 Kilogramm schwer?", "Der Polarwolf", ["Der Grauwolf", "Der Wolfshund", "Keiner"]],
    ["Wie schwer wird der Grauwolf bis zu?", "Bis zu 50 Kilogramm", ["Bis zu 5 Kilogramm", "Bis zu 150 Kilogramm", "Bis zu 500 Kilogramm"]],
    ["Welcher Wolf hat dichteres Fell, kleine runde Ohren und eine kurze Schnauze?", "Der Polarwolf", ["Der Grauwolf", "Der Wolfshund", "Alle gleich"]],
    ["Wovon ernährt sich der Polarwolf?", "Von Mäusen, Hasen, Lemmingen und Rentieren", ["Von Rehen und Wildschweinen", "Nur von Pflanzen", "Nur von Fischen"]],
    ["Wovon ernährt sich der Grauwolf?", "Von Rehen, Hirschen, Hasen und Wildschweinen, manchmal auch von Schafen und Ziegen", ["Nur von Lemmingen", "Nur von Beeren", "Nur von Insekten"]],
    ["Wofür nutzt der Mensch Hunde mit besonderen Fähigkeiten?", "Zum Beispiel als Polizeihunde, Jagdhunde, Wach- und Schutzhunde oder Hütehunde", ["Nur als Zugtiere", "Nur zum Essen", "Gar nicht"]],
    ["Wie markiert der Hund auffallende Stellen in seinem Revier?", "Mit Urin", ["Mit Kot", "Mit Farbe", "Mit Haaren"]],
  ];
  const WOLF_STIMMT = [
    ["Der Wolf ist die Stammform aller Haushunde.", true], ["Hunde verschiedener Rassen können keine gemeinsamen Nachkommen haben.", false],
    ["Wölfe leben meist als Einzelgänger.", false], ["Im Wolfsrudel hat jedes Mitglied seinen Platz.", true],
    ["Ein Wolf mit Demutsverhalten unterwirft sich dem ranghöheren Tier.", true], ["Beim Imponierverhalten macht sich der Wolf klein.", false],
    ["Durch das Demutsverhalten kommt es im Rudel selten zu blutigen Kämpfen.", true], ["Die Domestizierung machte aus dem Wildtier Wolf ein Haustier.", true],
    ["Der Hund versteht sich durch Körpersprache.", true], ["Der Hund markiert auffallende Stellen seines Reviers mit Urin.", true],
    ["Wölfe jagen ihre Beute über lange Strecken, bis sie erschöpft ist.", true], ["Alle Hunde gehören zu verschiedenen Arten.", false],
    ["Durch Züchtung sind viele unterschiedliche Hunderassen entstanden.", true], ["Mit Imponierverhalten wollen Wölfe beeindrucken.", true],
    ["Im Wolfsrudel bekommen alle Wölfe Junge.", false], ["Der Polarwolf wiegt bis zu 80 Kilogramm, der Grauwolf bis zu 50 Kilogramm.", true],
    ["Der Polarwolf hat dichteres Fell und kleine, runde Ohren.", true], ["Der Grauwolf lebt in sehr kalten nördlichen Regionen.", false],
    ["Wolfshunde zeigen meist mehr Verhaltensweisen des Wolfs als andere Rassen.", true], ["Die ersten Wölfe suchten erst vor 300 Jahren die Nähe des Menschen.", false],
    ["Der Grauwolf wiegt bis zu 80 Kilogramm, der Polarwolf bis zu 50 Kilogramm.", false], ["Wölfe jagen nur kurze Strecken und geben dann sofort auf.", false],
    ["Alle Hunderassen sind eigene Arten und können sich nicht untereinander fortpflanzen.", false],
  ];
  const WOLF_LUECKEN = [
    ["Der Wolf ist die Stammform aller ___.", ["Haushunde", "Haushund"], "Haushunde, Füchse, Katzen"],
    ["Der Vorgang, bei dem aus einem Wildtier ein Haustier wird, heißt ___.", ["Domestizierung"], "Domestizierung, Züchtung, Rangordnung"],
    ["Wenn der Mensch gezielt Tiere mit gewünschten Eigenschaften verpaart, nennt man das ___.", ["Züchtung", "Zucht"], "Züchtung, Domestizierung, Dressur"],
    ["Die vielen verschiedenen Hundearten heißen ___.", ["Rassen"], "Rassen, Rudel, Mischlinge"],
    ["Die Nachkommen von Tieren verschiedener Rassen heißen ___.", ["Mischlinge"], "Mischlinge, Rassen, Rudel"],
    ["Die Familiengruppe der Wölfe heißt ___.", ["Rudel"], "Rudel, Herde, Schwarm"],
    ["Im Rudel herrscht eine strenge ___.", ["Rangordnung"], "Rangordnung, Zucht, Jagd"],
    ["Um größer zu wirken, zeigt der Wolf ___.", ["Imponierverhalten"], "Imponierverhalten, Demutsverhalten, Drohverhalten"],
    ["Wer sich dem ranghöheren Tier unterwirft, zeigt ___.", ["Demutsverhalten"], "Demutsverhalten, Imponierverhalten, Drohverhalten"],
    ["Ein Wolf, der die Ohren anlegt, knurrt und die Zähne zeigt, zeigt ___.", ["Drohverhalten"], "Drohverhalten, Demutsverhalten, Imponierverhalten"],
    ["Ein Wolf ist ein ___, weil er seine Beute über lange Strecken verfolgt.", ["Hetzjäger"], "Hetzjäger, Schleichjäger, Nasentier"],
    ["Der ___ lebt in sehr kalten nördlichen Regionen und wiegt bis zu 80 Kilogramm.", ["Polarwolf"], "Polarwolf, Grauwolf, Wolfshund"],
    ["Der ___ lebt in Wäldern und Graslandschaften Europas und Asiens.", ["Grauwolf"], "Grauwolf, Polarwolf, Wolfshund"],
    ["Die Nachkommen von Wolf und Hund heißen ___.", ["Wolfshunde", "Wolfshund"], "Wolfshunde, Mischlinge, Rudel"],
    ["Nur ___ und Leitwölfin bekommen Junge.", ["Leitwolf"], "Leitwolf, Rüde, Rudel"],
  ];

  // ---------- Daten: Körpersprache (Buch S. 25 und 27) ----------
  const POSEN = { A: "Imponierverhalten", B: "Drohverhalten", C: "Angstverhalten" };
  const KOERPER_FAKTEN = [
    ["Woran erkennt man beim Wolf das Imponierverhalten?", "Er stellt sich aufrecht hin und hält die Rute erhoben", ["Er legt sich auf den Rücken", "Er zieht die Rute ein", "Er knurrt und zeigt die Zähne"]],
    ["Warum zeigen die Leitwölfe Imponierverhalten?", "Sie wollen größer erscheinen und beeindrucken", ["Sie haben Angst", "Sie wollen schlafen", "Sie wollen sich verstecken"]],
    ["Woran erkennt man beim Wolf das Drohverhalten?", "Der Körper versteift sich, die Rute ist waagerecht, die Ohren sind angelegt, er knurrt und zeigt die Zähne", ["Er legt sich auf den Rücken und zeigt die Kehle", "Er hält die Rute hoch und stellt sich aufrecht hin", "Er wedelt und springt herum"]],
    ["Woran erkennt man beim Wolf das Demutsverhalten?", "Er zieht die Rute ein, legt sich auf den Rücken und zeigt seine Kehle", ["Er hält die Rute senkrecht nach oben", "Er knurrt und zeigt die Zähne", "Er stellt sich aufrecht hin"]],
    ["Was bewirkt das Demutsverhalten im Rudel?", "Der schwächere Wolf unterwirft sich, deshalb gibt es selten blutige Kämpfe", ["Es gibt immer blutige Kämpfe", "Der schwächere Wolf wird Leitwolf", "Das Rudel löst sich auf"]],
    ["Was zeigt ein Wolf, der Angst hat und sich einem ranghöheren Tier unterwirft?", "Demutsverhalten (Angstverhalten)", ["Imponierverhalten", "Drohverhalten", "Jagdverhalten"]],
    ["Wie hält der Wolf beim Drohverhalten die Rute?", "Waagerecht", ["Senkrecht nach oben", "Eingezogen zwischen den Beinen", "Eingerollt auf dem Rücken"]],
    ["Wie hält der Leitwolf beim Imponierverhalten die Rute?", "Erhoben", ["Eingezogen", "Waagerecht", "Gar nicht"]],
    ["Woran kann man bei einem Hund die Stimmung erkennen?", "An der Stellung von Ohren und Rute und an seinen Lauten", ["Nur an der Größe", "Nur an der Fellfarbe", "Gar nicht"]],
    ["Welche Stimmung zeigt ein Hund, der den Vorderkörper nach unten drückt und Hinterteil und Rute nach oben streckt?", "Spielaufforderung", ["Furcht", "Anspannung", "Entspannung"]],
    ["Wie zeigt ein Hund Furcht?", "Er macht sich klein und klemmt die Rute ein", ["Er stellt sich aufrecht hin und wedelt hoch", "Er streckt Hinterteil und Rute nach oben", "Er liegt locker mit hängenden Ohren"]],
    ["Wie wirkt ein Hund, der entspannt ist?", "Locker, mit ruhiger Haltung", ["Steif und angespannt", "Geduckt mit eingeklemmter Rute", "Mit gesträubtem Fell"]],
    ["Welche sechs Stimmungen kann man auf den Bildern der Körperhaltung bei Hunden unterscheiden?", "Entspannung, Freude, Anspannung, Unterwerfung, Furcht und Spielaufforderung", ["Nur Freude und Wut", "Hunger, Durst und Schlaf", "Nur Angst und Mut"]],
  ];
  const KOERPER_STIMMT = [
    ["Beim Imponierverhalten macht sich der Wolf größer.", true], ["Beim Drohverhalten legt der Wolf die Ohren an und zeigt die Zähne.", true],
    ["Beim Demutsverhalten zeigt der Wolf dem ranghöheren Tier seine Kehle.", true], ["Beim Drohverhalten hält der Wolf die Rute eingezogen.", false],
    ["Auf Bild A der Wölfe hält der Wolf die Rute erhoben (Imponierverhalten).", true], ["Auf Bild C zeigt der Wolf Angstverhalten.", true],
    ["Der Hund verständigt sich durch Körpersprache.", true], ["Die Stellung der Ohren und der Rute verrät etwas über die Stimmung des Hundes.", true],
    ["Ein Hund mit eingeklemmter Rute und geducktem Körper ist entspannt und fröhlich.", false], ["Durch das Demutsverhalten kommt es selten zu blutigen Kämpfen im Rudel.", true],
    ["Beim Imponierverhalten legt der Wolf sich auf den Rücken und zeigt die Kehle.", false], ["Auf Bild B zeigt der Wolf Demutsverhalten.", false],
    ["Beim Drohverhalten wedelt der Wolf mit der erhobenen Rute und legt sich hin.", false], ["Auf Bild A macht sich der Wolf klein und zieht die Rute ein.", false],
    ["Wölfe verständigen sich nur durch Laute, nicht durch Körpersprache.", false],
  ];

  // ---------- Daten: Bedürfnisse und Hundehaltung (Buch S. 22) ----------
  const BEDARF_FAKTEN = [
    ["Wie alt werden Hunde meistens?", "10 bis 15 Jahre", ["2 bis 4 Jahre", "30 bis 40 Jahre", "50 Jahre"]],
    ["Was ist der Hund wie seine Wildform, der Wolf?", "Ein Rudeltier, das nicht gern allein ist", ["Ein Einzelgänger", "Ein Nachttier, das allein jagt", "Ein Winterschläfer"]],
    ["Wozu braucht ein Hund eine gute Erziehung?", "Damit das Zusammenleben im Alltag funktioniert", ["Damit er schneller wächst", "Damit er weniger frisst", "Damit er nicht mehr bellen kann"]],
    ["Was braucht ein Hund, damit er gesund bleibt und sich wohlfühlt?", "Geeignetes Futter und einen festen Schlafplatz", ["Nur einen Garten", "Nur Spielzeug", "Nur Fleisch vom Tisch"]],
    ["Was sollte regelmäßig beim Tierarzt gemacht werden?", "Untersuchen, entwurmen und impfen", ["Nur Fell scheren", "Nichts, Hunde brauchen keinen Tierarzt", "Zähne ziehen"]],
    ["Warum brauchen die meisten Hunde viel Platz und Möglichkeiten, sich zu bewegen?", "Sie sind gute und ausdauernde Läufer", ["Sie sind sehr faul", "Sie können nicht laufen", "Sie schlafen den ganzen Tag"]],
    ["Was brauchen besonders junge Hunde?", "Ausreichend Kontakt zu anderen Hunden und Menschen, um ihr Sozialverhalten zu trainieren", ["Möglichst viel Ruhe allein", "Nur Futter", "Keinen Kontakt zu anderen Hunden"]],
    ["Was ändert sich bei alten Hunden?", "Die Sinnesleistungen lassen nach und sie brauchen mehr Ruhe", ["Sie werden schneller und wilder", "Sie brauchen keinen Auslauf mehr", "Sie sehen und hören besser"]],
    ["Welche Kosten entstehen bei der Hundehaltung?", "Zum Beispiel für Leine, Geschirr, Futter, Fellpflege, Spielzeug, Tierarzt und Hundesteuer", ["Nur für das Futter", "Gar keine", "Nur die Anschaffung"]],
    ["Was kann man in der Hundeschule mit dem Hund üben?", "Verschiedene Alltagssituationen, zum Beispiel entspannt an der Leine laufen", ["Nur Kunststücke für den Zirkus", "Nur Jagen", "Nichts, der Hund lernt dort nicht"]],
    ["Was sollte man vor dem Hundekauf klären?", "Ob Hundehaltung erlaubt ist und ob jemand in der Familie gegen Tierhaare allergisch ist", ["Welche Farbe das Fell hat", "Nur den Preis", "Ob der Hund bellt"]],
    ["Warum ist ein Hund kein Spielzeug?", "Er ist ein Lebewesen, und man übernimmt Verantwortung für ihn", ["Weil er zu teuer ist", "Weil er zu schwer ist", "Weil er sprechen kann"]],
    ["Woher kann man einen Hund bekommen?", "Aus der Hundezucht oder aus dem Tierheim", ["Nur aus dem Wald", "Nur aus dem Zoo", "Nur aus dem Supermarkt"]],
    ["Was gehört zur Hundehaltung bei jedem Wetter dazu?", "Tägliche Beschäftigung und Auslauf", ["Den Hund im Haus lassen", "Nur Füttern", "Nur Streicheln"]],
    ["Wie nennt man einen männlichen Hund?", "Rüde", ["Hündin", "Welpe", "Leitwölfin"]],
  ];
  const BEDARF_STIMMT = [
    ["Ein Hund ist ein Rudeltier und möchte nicht gern allein sein.", true], ["Ein Hund braucht keine Erziehung.", false],
    ["Hunde sollten regelmäßig tierärztlich untersucht, entwurmt und geimpft werden.", true], ["Hunde der meisten Rassen sind gute und ausdauernde Läufer.", true],
    ["Bei alten Hunden lassen die Sinnesleistungen nach.", true], ["Zur Hundehaltung gehören auch Kosten für Futter, Tierarzt und Hundesteuer.", true],
    ["Ein Hund ist ein Spielzeug und braucht keine Verantwortung.", false], ["Vor dem Hundekauf sollte man klären, ob jemand in der Familie gegen Tierhaare allergisch ist.", true],
    ["Man kann einen Hund aus der Hundezucht oder aus dem Tierheim holen.", true], ["Junge Hunde brauchen keinen Kontakt zu anderen Hunden.", false],
    ["Ein Hund braucht nur bei schönem Wetter Auslauf.", false], ["Hunde werden meistens nur 2 bis 4 Jahre alt.", false],
    ["Bei der Hundehaltung entstehen keine Kosten außer für das Futter.", false], ["Ein Hund muss nie zum Tierarzt, wenn er gesund aussieht.", false],
    ["Alte Hunde brauchen mehr Ruhe als junge Hunde.", true],
  ];
  const BEDARF_LUECKEN = [
    ["Hunde werden meistens 10 bis ___ Jahre alt.", ["15"], "15, 5, 30"],
    ["Wie sein Vorfahre, der Wolf, ist der Hund ein ___ und nicht gern allein.", ["Rudeltier"], "Rudeltier, Einzelgänger, Nachttier"],
    ["Ein männlicher Hund heißt ___.", ["Rüde"], "Rüde, Welpe, Hündin"],
    ["Hunde sollten regelmäßig geimpft und ___ werden.", ["entwurmt"], "entwurmt, rasiert, gebadet"],
    ["Zur Hundehaltung gehören Kosten für Futter, Tierarzt und ___.", ["Hundesteuer"], "Hundesteuer, Kfz-Steuer, Eintrittsgeld"],
    ["Einen Hund zu halten bedeutet, ___ für ihn zu übernehmen.", ["Verantwortung"], "Verantwortung, Spielzeug, Hunger"],
    ["Bei alten Hunden lassen die ___ nach.", ["Sinnesleistungen", "Sinnesleistung"], "Sinnesleistungen, Krallen, Zähne"],
    ["Einen Hund bekommt man aus der Hundezucht oder aus dem ___.", ["Tierheim"], "Tierheim, Zoo, Wald"],
  ];

  // ---------- Daten: Der Geruchssinn (Buch S. 23) ----------
  const GERUCH_ZAHLEN = [
    ["Wie viele <b>Millionen Riechsinneszellen</b> hat ein Hund meistens?", 220, "Im Buch steht: Hunde haben meist 220 Millionen Riechsinneszellen."],
    ["Bis zu wie vielen <b>Millionen Riechsinneszellen</b> hat ein Mensch?", 10, "Der Mensch hat bis zu 10 Millionen."],
    ["Wie oft kann ein Hund bis zu in der <b>Minute</b> durch die Nasenlöcher einatmen?", 300, "Der Hund kann bis zu 300-mal in der Minute einatmen (Schnüffelatmung)."],
    ["Wie viele <b>Millionen Riechsinneszellen</b> hat ein Hund mehr als ein Mensch? (220 und 10 Millionen)", 210, "Rechne 220 − 10."],
    ["Der Hund hat 220 Millionen Riechsinneszellen, der Mensch 10 Millionen. Wie viele <b>Millionen</b> sind es zusammen?", 230, "Rechne 220 + 10."],
    ["Der Hund kann bis zu 300-mal in der Minute einatmen. Wie oft ist das in <b>2 Minuten</b>?", 600, "Rechne 300 · 2."],
    ["Der Hund kann bis zu 300-mal in der Minute einatmen. Wie oft ist das in <b>einer halben Minute</b> (30 Sekunden)?", 150, "Rechne 300 : 2."],
    ["Der Hund kann bis zu 300-mal in der Minute einatmen. Wie oft ist das in <b>einer Sekunde</b>?", 5, "Eine Minute hat 60 Sekunden: 300 : 60."],
    ["Der Hund kann bis zu 300-mal in der Minute einatmen. Wie oft ist das in <b>10 Sekunden</b>?", 50, "10 Sekunden sind ein Sechstel einer Minute: 300 : 6."],
  ];
  const GERUCH_FAKTEN = [
    ["Wo sitzen die Riechsinneszellen?", "In der Riechschleimhaut in der Nasenhöhle", ["In der Zunge", "Im Ohr", "In den Pfoten"]],
    ["Wie groß ist die Riechschleimhaut beim Hund?", "So groß wie ein DIN-A4-Blatt", ["So groß wie eine Briefmarke", "So groß wie ein Fußball", "So groß wie ein Tisch"]],
    ["Wie groß ist die Riechschleimhaut beim Menschen?", "Ungefähr so groß wie eine Briefmarke", ["So groß wie ein DIN-A4-Blatt", "So groß wie ein Tisch", "So groß wie eine Hand"]],
    ["Wie atmet der Hund beim Schnüffeln aus?", "Seitlich durch die Nasenlöcher", ["Durch das Maul", "Genauso wie er einatmet", "Durch die Ohren"]],
    ["Warum ist das seitliche Ausatmen beim Schnüffeln gut?", "Der erschnüffelte Geruch wird nicht verdünnt und die Riechsinneszellen werden ständig mit neuen Gerüchen versorgt", ["Der Hund kann dann lauter bellen", "Der Hund wird schneller müde", "Der Hund kann dann besser sehen"]],
    ["Wie nennt man die besondere Atemtechnik beim Schnüffeln?", "Schnüffelatmung", ["Hecheln", "Schnarchen", "Pfeifen"]],
    ["Warum haben Hunderassen mit verkürzter Schnauze oft eine schlechtere Riechleistung?", "Ihre Nasenöffnungen sind oft verengt", ["Sie haben keine Nase", "Sie riechen besser als alle anderen", "Sie haben mehr Riechzellen"]],
    ["Warum ist der Hund ein Nasentier?", "Wegen seines extrem feinen Geruchssinns", ["Weil er eine lange Nase hat", "Weil er nur Nasen mag", "Weil er nichts hört"]],
    ["Wie nimmt der Hund die Umwelt hauptsächlich wahr?", "Über die Nase", ["Über die Augen", "Über die Ohren", "Über die Haut"]],
    ["Wofür setzt der Mensch den Geruchssinn des Hundes gezielt ein?", "Zum Beispiel bei Polizeihunden, bei der Suche nach Vermissten und beim Erriechen von Krankheiten", ["Zum Schlittenziehen", "Zum Bewachen von Geld", "Zum Hüten von Schafen"]],
    ["Welche Gerüche kann der Hund gleichzeitig aufnehmen?", "Gerüche aus verschiedenen Richtungen", ["Nur Gerüche von vorne", "Nur Blumengerüche", "Keine"]],
  ];
  const GERUCH_STIMMT = [
    ["Hunde haben viel mehr Riechsinneszellen als Menschen.", true], ["Die Riechschleimhaut des Hundes ist so groß wie eine Briefmarke.", false],
    ["Der Hund atmet beim Schnüffeln seitlich durch die Nasenlöcher aus.", true], ["Der Hund kann bis zu 300-mal in der Minute einatmen.", true],
    ["Kurzschnauzrassen wie der Mops haben oft verengte Nasenöffnungen.", true], ["Der Hund nimmt die Umwelt hauptsächlich über die Augen wahr.", false],
    ["Die Riechsinneszellen sitzen in der Riechschleimhaut der Nasenhöhle.", true], ["Der Mensch hat 220 Millionen Riechsinneszellen.", false],
    ["Der Hund atmet beim Schnüffeln durch die Nasenlöcher nur ein und gar nicht aus.", false], ["Die Riechschleimhaut des Menschen ist so groß wie ein DIN-A4-Blatt.", false],
    ["Der Hund kann nur 3-mal in der Minute einatmen.", false],
  ];

  // ---------- Zeichnungen ----------
  const RED = "#e0364d", LINE = "#7a6a58", BONE = "#f4ead6", PINK = "#f3b3bb";
  // Hundeskelett von der Seite (Kopf rechts), ein Teil rot markiert
  function skelettSvg(hl) {
    const g = (k, body) => `<g data-teil="${k}" fill="${hl === k ? PINK : BONE}" stroke="${hl === k ? RED : LINE}" stroke-width="${hl === k ? 3.4 : 1.8}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
    const spine = hl === "wirbel" ? RED : LINE;
    const front = `<g fill="#ebe3d3" stroke="#a39682" stroke-width="1.6" stroke-linejoin="round"><path d="M218 142 L228 142 L231 184 L223 184Z"/><path d="M222 184 L232 184 L234 202 L226 202Z"/><path d="M225 202 L250 203 L250 209 L223 209Z"/></g>`;
    return `<svg class="nwfig skel" viewBox="0 0 320 214" role="img" aria-label="Skelett eines Hundes, ein Teil ist rot markiert"><line x1="10" y1="211" x2="310" y2="211" stroke="#b9c6d2" stroke-width="2"/>${front}`
      + g("oberarm", `<path d="M214 100 L230 100 L228 142 L218 142 Z"/>`)
      + g("rippen", `<path d="M140 66 Q132 100 150 122 Q175 130 200 114 Q206 90 196 66 Z"/><path d="M152 68 Q146 100 160 122 M166 68 Q160 102 172 126 M180 68 Q176 102 184 126 M194 70 Q192 100 196 118" fill="none"/>`)
      + g("schulter", `<path d="M212 66 L238 72 L230 110 L208 102 Z"/>`)
      + g("becken", `<path d="M82 66 L110 62 L116 98 L92 106 Q80 90 82 66 Z"/>`)
      + g("oberschenkel", `<path d="M96 98 L124 142 L114 150 L88 108 Z"/>`)
      + g("unterschenkel", `<path d="M124 142 L96 172 L84 164 L112 134 Z"/>`)
      + g("knie", `<path d="M110 139 L120 131 L131 137 L132 149 L121 155 L110 149 Z"/>`)
      + g("ferse", `<path d="M96 174 L82 154 L72 160 L86 184 Z"/>`)
      + g("mittelfuss", `<path d="M86 178 L102 178 L106 202 L94 202 Z"/>`)
      + g("zehen", `<path d="M94 202 L124 203 L124 209 L92 209 Z"/><path d="M104 203 V209 M114 203 V209" fill="none"/>`)
      + `<g data-teil="wirbel" fill="none" stroke="${hl === "wirbel" ? RED : LINE}" stroke-linecap="round"><path d="M250 72 Q205 50 150 60 Q110 66 88 70 Q60 72 40 100" stroke="${spine}" stroke-width="${hl === "wirbel" ? 11 : 9}"/><path d="M250 72 Q205 50 150 60 Q110 66 88 70 Q60 72 40 100" stroke="${hl === "wirbel" ? PINK : BONE}" stroke-width="5" stroke-dasharray="5 3"/></g>`
      + g("schaedel", `<path d="M258 50 Q284 40 304 58 L314 74 Q314 86 298 88 L272 90 Q254 86 254 68 Z"/><path d="M272 90 Q296 102 312 82" fill="none"/><circle cx="280" cy="60" r="3.2" fill="${hl === "schaedel" ? RED : LINE}"/>`)
      + `</svg>`;
  }
  // Drei Wölfe von der Seite (Kopf links): A Imponierverhalten, B Drohverhalten, C Angstverhalten
  function wolfSvg(hl) {
    const FUR = "#b9a99a", DARK = "#6f6155";
    const wolf = (id, ox, o) => {
      const mark = hl === id, fur = mark ? "#f3b3bb" : FUR, line = mark ? "#e0364d" : DARK, w = mark ? 3 : 1.8;
      const leg = (x, y1, y2, x2) => `<path d="M${ox + x} ${y1} L${ox + (x2 == null ? x : x2)} ${y2}" stroke="${line}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M${ox + x} ${y1} L${ox + (x2 == null ? x : x2)} ${y2}" stroke="${fur}" stroke-width="5.5" stroke-linecap="round" fill="none"/>`;
      return `<g data-pose="${id}" fill="${fur}" stroke="${line}" stroke-width="${w}" stroke-linejoin="round">`
        + leg(56, o.by + 22, 138, o.fx) + leg(70, o.by + 22, 138, o.fx + 12) + leg(108, o.by + 22, 138, o.hx) + leg(122, o.by + 18, 138, o.hx + 12)
        + `<path class="tail" d="M${ox + 126} ${o.by + 6} Q${ox + o.tx1} ${o.ty1} ${ox + o.tx2} ${o.ty2}" fill="none" stroke="${line}" stroke-width="11" stroke-linecap="round"/><path d="M${ox + 126} ${o.by + 6} Q${ox + o.tx1} ${o.ty1} ${ox + o.tx2} ${o.ty2}" fill="none" stroke="${fur}" stroke-width="7" stroke-linecap="round"/>`
        + `<path d="M${ox + 46} ${o.by} Q${ox + 70} ${o.by - 20} ${ox + 110} ${o.by - 15} Q${ox + 128} ${o.by - 12} ${ox + 130} ${o.by + 4} Q${ox + 127} ${o.by + 22} ${ox + 110} ${o.by + 24} L${ox + 56} ${o.by + 24} Q${ox + 40} ${o.by + 18} ${ox + 46} ${o.by} Z"/>`
        + `<path d="M${ox + 46} ${o.by - 6} L${ox + o.hx0 + 2} ${o.hy + 2} L${ox + o.hx0 + 10} ${o.hy + 30} L${ox + 62} ${o.by + 20} Z"/>`
        + `<path d="M${ox + o.hx0 - 24} ${o.hy + 14} L${ox + o.hx0 - 2} ${o.hy - 4} L${ox + o.hx0 + 22} ${o.hy + 2} L${ox + o.hx0 + 14} ${o.hy + 26} L${ox + o.hx0 - 14} ${o.hy + 26} Z"/>`
        + (o.teeth ? `<path d="M${ox + o.hx0 - 22} ${o.hy + 22} l4 6 l4 -6 M${ox + o.hx0 - 10} ${o.hy + 24} l4 6 l4 -6" fill="#fff" stroke="${DARK}" stroke-width="1.2"/>` : "")
        + `<path class="ear" d="M${ox + o.ear[0]} ${o.ear[1]} L${ox + o.ear[2]} ${o.ear[3]} L${ox + o.ear[4]} ${o.ear[5]} Z"/>`
        + `<circle cx="${ox + o.hx0 - 2}" cy="${o.hy + 8}" r="2.2" fill="${DARK}" stroke="none"/>`
        + `<circle cx="${ox + 70}" cy="147" r="11" fill="#fff" stroke="${line}" stroke-width="1.6"/><text x="${ox + 70}" y="153" text-anchor="middle" font-size="17" font-weight="700" fill="${DARK}" stroke="none">${id}</text></g>`;
    };
    return `<svg class="nwfig wolf" viewBox="0 0 470 162" role="img" aria-label="Drei Wölfe mit Körpersprache: A, B und C">`
      + wolf("A", 0, { by: 62, fx: 54, hx: 110, hx0: 26, hy: 28, tx1: 150, ty1: 44, tx2: 146, ty2: 14, ear: [20, 32, 28, 10, 38, 32], teeth: false })
      + wolf("B", 155, { by: 78, fx: 52, hx: 112, hx0: 22, hy: 66, tx1: 160, ty1: 80, tx2: 168, ty2: 82, ear: [28, 66, 46, 62, 36, 78], teeth: true })
      + wolf("C", 310, { by: 94, fx: 50, hx: 114, hx0: 22, hy: 90, tx1: 138, ty1: 126, tx2: 114, ty2: 132, ear: [28, 90, 46, 94, 34, 102], teeth: false })
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

  gen("bio.gebiss.zahl", "gebiss", "Zahnformel: Wie viele Zähne?", (r) => {
    const [q, ans, hint] = r.pick(ZAHL_FRAGEN);
    return numTask({ q, ans, hints: [hint, "Die Zahnformel im Buch (Seite 21): Oberkiefer 6 1 3 3 1 6, Unterkiefer 7 1 3 3 1 7."], solution: `${ans} Zähne`, pts: 1 });
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

  // ---------- Generatoren: Vom Wolf zum Hund ----------
  gen("bio.wolf.fakt", "wolf", "Vom Wolf zum Hund: Fragen", (r) => {
    const [q, right, wrong] = r.pick(WOLF_FAKTEN);
    const o = opts(r, right, [right].concat(wrong));
    return choiceTask(Object.assign({ q, hints: ["Lies im Buch nach: „Der Hund – ein beliebtes Haustier“ (Seite 24 und 25).", "Der Wolf ist die Stammform aller Haushunde. Im Wolfsrudel gibt es eine strenge Rangordnung."], solution: right }, o));
  });
  gen("bio.wolf.stimmt", "wolf", "Wolf und Hund: Stimmt das?", (r) => {
    const [s, ok] = r.pick(WOLF_STIMMT);
    return choiceTask({ q: `Stimmt die Aussage? <span class="nwsatz">${s}</span>`, options: ["stimmt", "stimmt nicht"], correct: ok ? 0 : 1, hints: ["Denk an das Buch, Seite 24 und 25.", ok ? "Diese Aussage steht so im Buch." : "Tipp: Hier ist etwas verdreht. Was müsste richtig heißen?"], solution: ok ? "stimmt" : "stimmt nicht" });
  });
  gen("bio.wolf.luecke", "wolf", "Wolf und Hund: Lückentext", (r, lvl) => {
    const [s, ans, box] = r.pick(WOLF_LUECKEN);
    return textTask({ q: `Ergänze: <span class="nwsatz">${s.replace("___", '<span class="kbx">?</span>')}</span>${lvl === 1 ? `<br><small>Wortkasten: ${box}</small>` : ""}`, accept: ans, hints: [`Wortkasten: ${box}`, "Das Wort beginnt mit " + ans[0][0].toUpperCase() + "."], solution: ans[0] });
  });

  // ---------- Generatoren: Körpersprache ----------
  gen("bio.koerper.bild", "koerper", "Körpersprache des Wolfs (Bilder A, B, C)", (r, lvl) => {
    const L = r.pick(["A", "B", "C"]), name = POSEN[L];
    const hints = ["A: der Wolf steht aufrecht und hält die Rute hoch. B: der Körper ist steif, die Rute waagerecht, die Zähne sind zu sehen. C: der Wolf macht sich klein und klemmt die Rute ein.", "Imponierverhalten = beeindrucken, Drohverhalten = drohen, Angstverhalten = große Angst."];
    const fig = `<div class="nwfigw">${wolfSvg()}</div>`;
    if (lvl === 3) return textTask({ q: `${fig}Wie heißt das Verhalten des Wolfs auf <b>Bild ${L}</b>? (zum Beispiel: Drohverhalten)`, accept: [name].concat(L === "C" ? ["Demutsverhalten"] : []), hints, solution: name });
    if (lvl === 2) { const o = opts(r, name, Object.values(POSEN).concat(["Spielverhalten"]), 4); return choiceTask(Object.assign({ q: `${fig}Welches Verhalten zeigt der Wolf auf <b>Bild ${L}</b>?`, hints, solution: name }, o)); }
    const o = opts(r, "Bild " + L, ["Bild A", "Bild B", "Bild C"], 3);
    return choiceTask(Object.assign({ q: `${fig}Auf welchem Bild zeigt der Wolf <b>${name}</b>?`, hints, solution: "Bild " + L }, o));
  });
  gen("bio.koerper.fakt", "koerper", "Körpersprache: Fragen", (r) => {
    const [q, right, wrong] = r.pick(KOERPER_FAKTEN);
    const o = opts(r, right, [right].concat(wrong));
    return choiceTask(Object.assign({ q, hints: ["Lies im Buch nach: „Verständigung“ (Seite 25) und „Körpersprache des Hundes“ (Seite 27).", "Imponieren: aufrecht und Rute hoch. Drohen: steif, Rute waagerecht, Zähne zeigen. Demut: Rute einziehen, auf den Rücken legen."], solution: right }, o));
  });
  gen("bio.koerper.stimmt", "koerper", "Körpersprache: Stimmt das?", (r) => {
    const [s, ok] = r.pick(KOERPER_STIMMT);
    return choiceTask({ q: `Stimmt die Aussage? <span class="nwsatz">${s}</span>`, options: ["stimmt", "stimmt nicht"], correct: ok ? 0 : 1, hints: ["Denk an das Buch, Seite 25 und 27, und an die drei Wölfe A, B und C.", ok ? "Diese Aussage steht so im Buch." : "Tipp: Hier ist etwas verdreht. Was müsste richtig heißen?"], solution: ok ? "stimmt" : "stimmt nicht" });
  });

  // ---------- Generatoren: Bedürfnisse und Hundehaltung ----------
  gen("bio.bedarf.fakt", "bedarf", "Bedürfnisse und Hundehaltung: Fragen", (r) => {
    const [q, right, wrong] = r.pick(BEDARF_FAKTEN);
    const o = opts(r, right, [right].concat(wrong));
    return choiceTask(Object.assign({ q, hints: ["Lies im Buch nach: „Bedürfnisse des Hundes“, „Hundehaltung“ und „Hundekauf“ (Seite 22).", "Ein Hund ist ein Lebewesen: Er braucht Futter, einen Schlafplatz, Erziehung, Auslauf, Gesellschaft und den Tierarzt."], solution: right }, o));
  });
  gen("bio.bedarf.stimmt", "bedarf", "Hundehaltung: Stimmt das?", (r) => {
    const [s, ok] = r.pick(BEDARF_STIMMT);
    return choiceTask({ q: `Stimmt die Aussage? <span class="nwsatz">${s}</span>`, options: ["stimmt", "stimmt nicht"], correct: ok ? 0 : 1, hints: ["Denk an das Buch, Seite 22.", ok ? "Diese Aussage steht so im Buch." : "Tipp: Hier ist etwas verdreht. Was müsste richtig heißen?"], solution: ok ? "stimmt" : "stimmt nicht" });
  });
  gen("bio.bedarf.luecke", "bedarf", "Hundehaltung: Lückentext", (r, lvl) => {
    const [s, ans, box] = r.pick(BEDARF_LUECKEN);
    return textTask({ q: `Ergänze: <span class="nwsatz">${s.replace("___", '<span class="kbx">?</span>')}</span>${lvl === 1 ? `<br><small>Wortkasten: ${box}</small>` : ""}`, accept: ans, hints: [`Wortkasten: ${box}`, "Das Wort beginnt mit " + ans[0][0].toUpperCase() + "."], solution: ans[0] });
  });

  // ---------- Generatoren: Geruchssinn ----------
  gen("bio.geruch.zahl", "geruch", "Der Geruchssinn: Zahlen", (r) => {
    const [q, ans, hint] = r.pick(GERUCH_ZAHLEN);
    return numTask({ q, ans, hints: [hint, "Lies im Buch nach: „Geruchssinn des Hundes“ (Seite 23)."], solution: String(ans), pts: 1 });
  });
  gen("bio.geruch.fakt", "geruch", "Der Geruchssinn: Fragen", (r) => {
    const [q, right, wrong] = r.pick(GERUCH_FAKTEN);
    const o = opts(r, right, [right].concat(wrong));
    return choiceTask(Object.assign({ q, hints: ["Lies im Buch nach: „Geruchssinn des Hundes“ (Seite 23).", "Der Hund hat meist 220 Millionen Riechsinneszellen, der Mensch bis zu 10 Millionen."], solution: right }, o));
  });
  gen("bio.geruch.stimmt", "geruch", "Geruchssinn: Stimmt das?", (r) => {
    const [s, ok] = r.pick(GERUCH_STIMMT);
    return choiceTask({ q: `Stimmt die Aussage? <span class="nwsatz">${s}</span>`, options: ["stimmt", "stimmt nicht"], correct: ok ? 0 : 1, hints: ["Denk an das Buch, Seite 23.", ok ? "Diese Aussage steht so im Buch." : "Tipp: Hier ist etwas verdreht. Was müsste richtig heißen?"], solution: ok ? "stimmt" : "stimmt nicht" });
  });

  // ---------- Themen ----------
  const BIOT = [
    { id: "hund", name: "Der Hund – ein Säugetier", icon: "🐕", lern: true, fach: "bio" },
    { id: "skelett", name: "Das Hundeskelett", icon: "🦴", lern: true, fach: "bio" },
    { id: "gebiss", name: "Das Raubtiergebiss", icon: "🦷", lern: true, fach: "bio" },
    { id: "rassen", name: "Hunderassen & Hundearbeit", icon: "🐶", lern: true, fach: "bio" },
    { id: "welpe", name: "Ein Welpe wird geboren", icon: "🍼", lern: true, fach: "bio" },
    { id: "wolf", name: "Vom Wolf zum Hund", icon: "🐺", lern: true, fach: "bio" },
    { id: "koerper", name: "Körpersprache", icon: "💬", lern: true, fach: "bio" },
    { id: "geruch", name: "Der Geruchssinn", icon: "👃", lern: true, fach: "bio" },
    { id: "bedarf", name: "Bedürfnisse & Hundehaltung", icon: "🏠", lern: true, fach: "bio" },
    { id: "katze", name: "Die Katze – ein Schleichjäger", icon: "🐈", lern: false, fach: "bio" },
  ];
  BIOT.forEach((t) => { t.gens = Object.values(G).filter((g) => g.topic === t.id).map((g) => g.id); TOPICS.push(t); });
  const MERKE = {
    hund: "Der Hund ist ein Säugetier und das älteste Haustier des Menschen. Er ist ein Nasentier (feine Spürnase), ein Ohrentier (hört hohe Töne), ein Zehengänger (läuft nur auf den Zehen, schnell und ausdauernd) und ein Hetzjäger (verfolgt die Beute lange). Er gehört zu den Landraubtieren.",
    skelett: "Hundeskelett: Schädel, Wirbelsäule, Schulterblatt, Rippen, Beckenknochen. Das Hinterbein von oben nach unten: Oberschenkelknochen, Kniegelenk, Unterschenkelknochen (Schienbein und Wadenbein), Fersenknochen, Fußwurzelknochen, Mittelfußknochen, Zehenknochen. Das Vorderbein beginnt mit dem Oberarmknochen. Der Hund tritt nur mit den Zehenknochen auf (Zehengänger), der Mensch ist ein Sohlengänger. Der Hund ist ein Wirbeltier.",
    gebiss: "Raubtiergebiss: Die kleinen Schneidezähne zupfen Fleischreste von Knochen ab. Die langen, dolchartigen Eckzähne sind Fangzähne (packen, festhalten, töten). Im Ober- und Unterkiefer gibt es je einen großen, gezackten Reißzahn (zerschneidet die Beute). Die Backenzähne zerkleinern die Nahrung; die zwei größten, schärfsten Backenzähne in jedem Kiefer heißen Reißzähne. Zahnformel: Oberkiefer 6 1 3 3 1 6, Unterkiefer 7 1 3 3 1 7, zusammen 42 Zähne.",
    rassen: "Es gibt über 400 gezüchtete Hunderassen. Man züchtet sie für Aufgaben: Jagdhund (Dackel, Foxterrier, Irischer Setter, Beagle, Windhund), Schlittenhund (Husky), Begleithund (Zwergpudel, Yorkshireterrier), Wachhund (Boxer, Deutscher Schäferhund, Englische Bulldogge), Such- und Rettungshund (Bernhardiner), Hütehund, Blindenhund, Polizeihund (Spürhund).",
    wolf: "Polarwolf: sehr kalte nördliche Regionen, dichteres Fell, kleine runde Ohren, kurze Schnauze, bis 80 kg, frisst Mäuse, Hasen, Lemminge, Rentiere. Grauwolf: Wälder und Graslandschaften Europas und Asiens, bis 50 kg, frisst Rehe, Hirsche, Hasen, Wildschweine. Wolfshunde (Wolf und Hund) zeigen mehr Wolfsverhalten. Nur Leitwolf und Leitwölfin bekommen Junge. Der Wolf ist die Stammform aller Haushunde. Domestizierung: aus dem Wildtier wird ein Haustier. Züchtung: gezieltes Verpaaren, so entstehen Rassen; Nachkommen verschiedener Rassen heißen Mischlinge. Wolfsrudel: 5 bis 10 Tiere mit Leitwolf und Leitwölfin und strenger Rangordnung. Imponierverhalten (beeindrucken), Drohverhalten, Demutsverhalten (unterwerfen).",
    welpe: "Bei der Hündin: Aufreißen der Fruchtblase, Zerbeißen der Nabelschnur, Trockenlecken, Milchbildung. Beim Welpen: unbeholfenes Kriechen, Pendeln mit dem Kopf, Saugen an den Zitzen, Milchtritt, Trinken der Milch.",
    koerper: "Wolf: Imponierverhalten (aufrecht, Rute erhoben, größer wirken), Drohverhalten (Körper steif, Rute waagerecht, Ohren angelegt, knurren, Zähne zeigen), Demutsverhalten (Rute einziehen, auf den Rücken, Kehle zeigen: Unterwerfung, deshalb selten blutige Kämpfe). Bilder: A Imponieren, B Drohen, C Angst. Beim Hund verraten Ohren, Rute und Laute die Stimmung: Entspannung, Freude, Anspannung, Unterwerfung, Furcht, Spielaufforderung.",
    geruch: "Riechsinneszellen sitzen in der Riechschleimhaut der Nasenhöhle: Hund meist 220 Millionen (Fläche wie ein DIN-A4-Blatt), Mensch bis zu 10 Millionen (Fläche wie eine Briefmarke). Schnüffelatmung: bis zu 300-mal pro Minute einatmen, seitlich durch die Nasenlöcher ausatmen, so wird der Geruch nicht verdünnt. Kurzschnauzrassen (Mops) haben oft verengte Nasenöffnungen.",
    bedarf: "Hunde werden 10 bis 15 Jahre alt. Der Hund ist ein Rudeltier, braucht Erziehung (Hundeschule), geeignetes Futter, einen festen Schlafplatz, viel Auslauf, Gesellschaft und den Tierarzt (untersuchen, entwurmen, impfen). Junge Hunde brauchen Kontakt, alte mehr Ruhe. Kosten: Leine, Geschirr, Futter, Fellpflege, Spielzeug, Tierarzt, Hundesteuer. Hundekauf: Verantwortung, Haltung erlaubt?, Allergien, Hundezucht oder Tierheim. Rüde = männlicher Hund.",
    katze: "Die Katze ist ein Schleichjäger (schleicht sich an und springt kurz), der Hund ein Hetzjäger. Katzen haben einziehbare Krallen (Geheimwaffe), sehen in der Dämmerung und nachts sehr gut (jeder Lichtstrahl wird doppelt genutzt), haben Tasthaare und bewegliche Ohren. Früher schützten sie die Getreidevorräte.",
  };

  // ---------- Probearbeit Biologie ----------
  function probearbeit(seed) {
    const r = R(seed), s = () => r.int(1, 2 ** 31 - 1);
    const mk = (g, l) => A.make(g, l, s());
    const parts = [
      ["Der Hund – ein Säugetier", [["bio.typ", 2], ["bio.typ", 3], ["bio.stimmt", 1], ["bio.stimmt", 1], ["bio.luecke", 2]]],
      ["Skelett und Gebiss", [["bio.skelett.bild", 2], ["bio.skelett.bild", 3], ["bio.gebiss.bild", 2], ["bio.gebiss.bild", 3], ["bio.gebiss.funktion", 2], ["bio.gebiss.zahl", 2]]],
      ["Hunderassen und Hundearbeit", [["bio.rassen", 2], ["bio.rassen", 3], ["bio.arbeit", 2], ["bio.arbeit", 3]]],
      ["Ein Welpe wird geboren", [["bio.welpe.reihe", 2], ["bio.welpe.reihe", 2], ["bio.welpe.fakt", 2], ["bio.welpe.fakt", 2]]],
      ["Vom Wolf zum Hund", [["bio.wolf.fakt", 2], ["bio.wolf.stimmt", 1], ["bio.wolf.stimmt", 1], ["bio.wolf.luecke", 2], ["bio.wolf.fakt", 2]]],
      ["Körpersprache", [["bio.koerper.bild", 2], ["bio.koerper.bild", 3], ["bio.koerper.fakt", 2], ["bio.koerper.stimmt", 1]]],
      ["Geruchssinn, Bedürfnisse und Hundehaltung", [["bio.geruch.zahl", 2], ["bio.geruch.fakt", 2], ["bio.bedarf.fakt", 2], ["bio.bedarf.stimmt", 1], ["bio.bedarf.luecke", 2]]],
    ];
    return parts.map(([title, ts], i) => ({ nr: i + 1, title, tasks: ts.map(([g, l]) => { const t = mk(g, l); if (t.kind === "text") t.pts = Math.max(t.pts, 2); return t; }) }));
  }

  const api = { TYPEN, TYP_AUSSAGEN, STIMMT, LUECKEN, SKELETT, SKELETT_FAKTEN, GEBISS, GEBISS_FAKTEN, ZWECKE, POSEN, KOERPER_FAKTEN, KOERPER_STIMMT, BEDARF_FAKTEN, BEDARF_STIMMT, BEDARF_LUECKEN, GERUCH_ZAHLEN, GERUCH_FAKTEN, GERUCH_STIMMT, wolfSvg, ZAHNFORMEL, ZAHL_FRAGEN, WOLF_FAKTEN, WOLF_STIMMT, WOLF_LUECKEN, RASSEN, ARBEIT, HUENDIN, WELPE, WELPE_FAKTEN, KATZE_FAKTEN, KATZE_STIMMT, VERGLEICH, MERKE, norm, skelettSvg, gebissSvg, probearbeit };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BIO = api;
})(typeof self !== "undefined" ? self : this);
