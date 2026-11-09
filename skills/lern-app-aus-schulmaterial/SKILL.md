---
name: lern-app-aus-schulmaterial
description: Baut aus Fotos von Lernzettel, Schulbuch, Heft oder Lehrer-Mail eine Übungs-App (PWA) fürs iPad für ein Kind vor einer Klassenarbeit oder LZK. Verwenden, wenn Eltern Schulmaterial schicken und üben, abfragen, Fehler wiederholen oder eine Probearbeit mit Note wollen, in jedem Fach und jeder Klasse. Klärt vorher, ob Rechtschreibung in der Prüfung zählt.
---

# Lern-App aus Schulmaterial

Ziel: Ein Kind übt für eine konkrete Arbeit, ähnlich wie im Buch, mit Hilfe, Fehlerkiste und einer Probearbeit mit Zeit und Note. Die Eltern sind keine Techniker. Sprich mit ihnen einfach und auf Deutsch, wenn sie Deutsch schreiben.

Danach geht es weiter mit dem Skill `app-auf-github-pages` (Veröffentlichen).

## 1. Material lesen
- **Lernzettel zuerst.** Er sagt, was drankommt. Die Themen heißen so wie dort.
- Dann Buchseiten und Heft: Aufgabentypen, Fachbegriffe, Schreibweisen.
- Dann alte Tests und Mails der Lehrkraft: Ablauf, Zeit, Punkte, Hilfsmittel.
- Alles, was ein Bild braucht (Zahlenstrahl, Diagramm, Karte), als eigene Aufgabenart merken.
- Fotos sind oft schief oder unscharf. Unleserliches nicht raten, nachfragen.
- Bücher und Arbeitsblätter haben ein Urheberrecht: Aufgaben **nicht abschreiben**, sondern pro Typ einen Generator bauen.

## 2. Vorher fragen (kurz, mit Auswahl)
1. Wann ist die Arbeit? (bestimmt, wie viel Schmuck vorher möglich ist)
2. Wie ist die Prüfung? Blatt oder mündlich, Dauer, Hilfsmittel, Punkte.
3. **Zählt Rechtschreibung? Siehe unten. Nie raten.**
4. Was mag das Kind? (Tiere, Spiele, Farben). Daraus wird der Begleiter und die Belohnung.
5. Schwierigkeiten: Konzentration, Zeitdruck, Motivation (ADHS braucht kurze Runden und viel direkte Rückmeldung).
6. Soll die App kindlicher oder „erwachsener“ wirken? Ein 11-Jähriges Kind will nicht wie ein 4-Jähriges behandelt werden.

## 3. Rechtschreibung: Parameter pro Fach und Prüfung
Rechtschreibung zählt je nach Klasse und Fach. Es gibt keinen sicheren Standard. Frage nach der Aussage der Lehrkraft oder nach der Prüfungsform und trage das pro Fach ein.

| Einstellung | Bedeutung | Typisches Beispiel |
|---|---|---|
| `streng` | Schreibweise muss stimmen | Diktat, Vokabeltest, Deutscharbeit |
| `erkennbar` | Gleich klingende Schreibweisen und kleine Tippfehler gelten als richtig. Die Schreibweise wird nur markiert und weiter geübt. | Sachunterricht, wenn die Lehrkraft sagt „wird nicht bewertet“ |
| `tolerant` | Nur Umlaute, ß/ss, Groß-/Kleinschreibung und Bindestriche sind egal | Fachbegriffe in Mathe, wenn nur der Begriff zählt |

Umsetzung der Prüfung `judge(eingabe, richtige_namen, andere_begriffe)`:
- `tolerant`: Eingabe auf Kleinbuchstaben bringen, ß→ss, ä→a, ö→o, ü→u, Sonderzeichen entfernen, vergleichen.
- `erkennbar`: zusätzlich ein **Lautschlüssel** (ph→f, v→f, ck→k, tz/z→ts, Dehnungs-h und ie→i, Doppelbuchstaben einfach, Auslaut d/g/b→t/k/p) und eine Toleranz nach Wortlänge (bis 3 Buchstaben 0 Fehler, bis 5 einer, bis 9 zwei, darüber drei).
- **Schutzregel:** Ein Tippfehler zählt nur, wenn er keinem **anderen** Begriff der Frage näher oder gleich nah ist („Main“ darf nicht als „Rhein“ gelten, „Sachsen“ nicht für „Sachsen-Anhalt“).
- Als Test einen **Verwechslungstest** über alle Begriffspaare derselben Kategorie schreiben: kein Name darf für einen anderen als richtig durchgehen.
- Im Ergebnis ehrlich sagen: „x Schreibfehler markiert, aber nicht bewertet“. Und nicht: „Das ist deine Schulnote“.
- Wird bewertet (`streng`), Schreibfehler mit Buchstabenvergleich zeigen (Eingabe gegen richtiges Wort markieren).

In Mathe sind Fachbegriffe (Summand, Divisor, Quotient) meist `erkennbar` oder `tolerant`. Das ist ein Vorschlag, die Lehrkraft entscheidet.

## 4. Aufbau der App
Reine Webseite ohne Build-Schritt, läuft offline: `public/index.html`, `style.css`, `aufgaben.js` (Logik, läuft auch in Node), `app.js`, `sw.js` (Offline), `manifest.webmanifest`, `icons/`. Speicherstand in `localStorage` mit Versionsfeld, robust gegen kaputte Daten.

**Aufgabenformat** (Details in `vorlagen.md`): Jede Aufgabe kommt aus `make(generator, stufe, seed)` und ist damit wiederfindbar (Fehlerkiste). Sie hat `q` (Frage, auch mit SVG), `kind` (Eingabeart), `check(eingabe)`, `answer`, `hints` (mindestens 1), `solution` (Lösungsweg), `pts`.

Eingabearten, die sich bewährt haben: `num`, `text`, `choice`, `cells` (mehrere Felder), `place` (auf Bild tippen), `order` (in Reihenfolge tippen), `written` (Kästchenpapier).

**Funktionen:**
- Üben nach Themen, Stufen ○ ◐ ● steigen mit.
- Hilfe in drei Stufen: Tipp, nächster Schritt, ganzer Weg. Mit Hilfe gelöst zählt halb und kommt in die Fehlerkiste.
- Fehlerkiste: Eine Aufgabe ist erst erledigt, wenn sie **zweimal hintereinander** richtig war.
- Probearbeit: Zeit, Punkte pro Aufgabe, Note **als Schätzung** mit änderbarem Schlüssel. Aufbau wie der Test im Buch oder Material der Lehrkraft. Die Uhr läuft weiter, auch wenn die App kurz verlassen wird. Antworten werden laufend gespeichert.
- Fortschritt je Thema, Serie von Tagen, Zähler „noch x Tage bis zur Arbeit“.
- Belohnungen passend zum Kind (Begleiter mit Outfits, Orte, Sticker). Ruhig statt grell, besonders bei Konzentrationsproblemen.
- Eltern-Bereich: Zeit der Probearbeit, Notenschlüssel, Verlauf.

## 5. Typische Fallen
- **Aufgaben aus den echten Tests müssen erzeugbar sein.** Beide Lehrer-Tests als Gegenprobe im Test festhalten.
- **Überschlag frei wählbar:** Das Buch sagt oft „muss sich nicht an Rundungsregeln halten“. Akzeptiere jeden sinnvollen Überschlag (glatte Zahlen, nah genug am Ergebnis), nicht nur einen.
- Zahlwörter immer in beide Richtungen prüfen (Zahl → Wort → Zahl) und mit Zufallszahlen testen. Unter einer Million klein und zusammen, ab Million getrennt.
- **CSS-Klassen nicht doppelt vergeben** (`.box`, `.bar`). Eine Kollision hat Diagramme und Antwortfelder unsichtbar gemacht.
- Mehrere Hinweisfenster („Neuer Sticker“, „Freigeschaltet“) nacheinander zeigen, nicht übereinander.
- Eingabe auf dem iPad: `inputmode="numeric"`, Schriftgröße mindestens 16 px (sonst zoomt Safari), große Tippflächen.
- Bei Zahlen mit Tausenderpunkt: Anzeige mit schmalem Leerzeichen, Prüfung ohne Punkte und Leerzeichen.
- Nichts als fertig melden, ohne die Screenshots angesehen zu haben.

## 6. Tests (Pflicht)
1. **Logik-Test in Node:** Pro Generator und Stufe mehrere Hundert Aufgaben mit festem Startwert (Zufallsfunktion `mulberry32`, damit seltene Fälle vorkommen). Richtige Antwort wird angenommen, ein Nachbarwert abgelehnt, Frage und Lösung enthalten kein `undefined` oder `NaN`.
2. **Browser-Test (Playwright, Chromium):** Jede Eingabeart einmal richtig lösen, Hilfe in Stufen, Fehlerkiste füllen und leeren, Probearbeit bis zur Note (alles richtig = Note 1), Neuladen mitten in der Arbeit, Zeit läuft ab, kaputter Spielstand, schmale Breite ohne seitliches Scrollen.
3. **Offline-Test:** Laden, Netz trennen, neu laden.
4. **Screenshots** von Start, Aufgabe, Hilfe, Auswertung ansehen und den Eltern zeigen.

## 7. Gestaltung
Farben und Figur nach den Wünschen des Kindes. Ein Vorbild aus einer anderen App ist als **Stil** erlaubt (Farben, Formen, Gesichtszüge). Die Figur selbst nicht nachzeichnen. Frage bei Bedarf nach einem Screenshot, denn die Suche im Netz liefert keine Bilder.
