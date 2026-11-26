# Capy & Schule (Mathe und Naturwissenschaften)

Lern-App fürs iPad für Emmas erste Mathe-Klassenarbeit in Klasse 5 (Gymnasium BW, Kapitel I „Die natürlichen Zahlen“). Mochi, das Capybara, übt mit ihr.

## Cozy Winter
Die App ist im Winter-Design (Schnee, Eisblau, Tannengrün, dazu Schneefall, der sich ausschalten lässt; in den Einstellungen gibt es auch das Herbst-Design). Mochi hat über 50 Teile: Mützen, Brillen, Schals, Schmuck, Pullover und Jacken, Dinge in der Hand, Flügel und kleine Freunde, nur ein kleiner Startsatz (9 Teile) ist gleich frei, der Rest wird gleichmäßig bis 1450 Schneeflocken freigeschaltet (ein neues Teil alle ca. 30 Punkte), pro Bereich ein Teil. Dazu 15 Orte (4 gleich frei, der Rest gestaffelt) (Onsen im Schnee, Winterwald, Berghütte, Eissee, Weihnachtsmarkt, Iglu, Nordlicht, Weihnachtsbaum, Lebkuchenhaus …). Code in `public/garderobe.js`, Tests `tools/test-garderobe.mjs` und `tools/e2e-winter.mjs`.

Themen-Sets: 5 Sets (Weltraum, Eiszauber, Weihnachtsbäckerei, Polarnacht, Goldener Tag, je 20 Teile und 2 Orte, zusammen 100 Teile und 10 Orte) erscheinen nacheinander (15.11., 17.11., 19.11., 21.11., 23.11.). Ihre Punkte zählen ab dem Stand beim Update (`flags.xpBase`), damit auch bei vielen gesammelten Punkten wieder etwas zum Sammeln da ist. Die Teile sind die Grundteile in neuen Farben (`shiftHue` in `public/garderobe.js`); neue Sets lassen sich in `C.THEMES` ergänzen.

Fragen wiederholen sich nicht: in den Übungsrunden wird eine bereits gestellte Frage (die letzten 60 der Sitzung) übersprungen, und „Gradnetz: Zahlen“ hat jetzt viele verschiedene Fragen.

Der Fortschritt geht nicht verloren: Er wird zweifach im Browser und zusätzlich in IndexedDB gespeichert (und beim Schließen noch einmal), ein beschädigter Stand wird aus der Kopie wiederhergestellt. In den Einstellungen gibt es „Sicherung speichern“ (Datei `capy-sicherung-Datum.json`) und „Sicherung laden“. Die Versionsanzeige oben zeigt „gesichert ✓“ oder wird amber, wenn die letzte Sicherungsdatei älter als 3 Tage ist; Antippen speichert eine Sicherung. Test: `tools/e2e-sicherung.mjs`.

## Naturwissenschaften (Klasse 5, Erde im Weltall)
Oben auf der Startseite wählt man das Fach. Themen nach den Heftseiten und Arbeitsblättern: Sonnensystem und Planeten (Merksatz, innere und äußere Planeten, Steckbriefe), Sterne, Planeten und Monde, ein Tag auf der ISS, Gradnetz der Erde (mit Zeichnungen zum Beschriften). Fehlerkiste und Probearbeit mit Notenschätzung gibt es auch hier (`public/nw.js`, Tests `tools/test-nw.mjs` und `tools/e2e-nw.mjs`).

Das Fach **Biologie** (Hund und Katze) hat sechs Themen nach den Arbeitsblättern und Heftseiten: der Hund als Säugetier (Nasentier, Ohrentier, Zehengänger, Hetzjäger), das Hundeskelett und das Raubtiergebiss (beide mit eigenen Zeichnungen zum Beschriften), Hunderassen und Hundearbeit, ein Welpe wird geboren und die Katze als Schleichjäger. Alle Fragen und Bilder sind selbst gemacht, Fehlerkiste und Probearbeit mit Notenschätzung wie in den anderen Fächern. Die Bio-Arbeit ist am 4.12.2026 (Standardtermin, in den Einstellungen änderbar; ohne Termin gibt es keinen Countdown). Code in `public/bio.js`, Tests `tools/test-bio.mjs` und `tools/e2e-bio.mjs`; beim ersten Start mit dieser Version wird einmal auf Biologie umgeschaltet.

## Mathe
- **Alle Themen vom Lernzettel einzeln üben:**
  - Zahlenstrahl
  - Stellentafel und Zahlwörter
  - Runden
  - schriftlich plus, minus, mal und geteilt
  - Fachbegriffe
  - Platzhalter, Zahlenmauern und Rechenketten
  - Sachaufgaben
  - Zweiersystem
  - römische Zahlen
  - Diagramme
  - als Extra: Längen
  - Die Aufgaben werden jedes Mal neu erzeugt, ähnlich wie im Buch (S. 6–37) und im Arbeitsheft, aber nicht genau dieselben.
- **Hilfe in Stufen:** erst ein Tipp, dann der nächste Schritt, dann der ganze Lösungsweg.
- **Fehlerkiste:** Falsche Aufgaben kommen wieder, bis sie zweimal hintereinander richtig sind.
- **Probearbeit mit Zeit (Standard 45 Minuten):**
  - aufgebaut wie der Buch-Test S. 37
  - Punkte pro Aufgabe, beim schriftlichen Rechnen auch für den Überschlag
  - am Ende eine Note mit Tendenz
  - Der Notenschlüssel ist änderbar und als Schätzung beschriftet.
- **Gemütlich:**
  - Herbst-Farben, abends dunkel
  - Mochi mit Outfits zum Freischalten
  - Orte (Onsen, Herbstwald, …)
  - Sticker-Album, Sprüche, Witze und Capybara-Fakten
  - Lo-fi-Musik, die in der App erzeugt wird (keine Dateien)
- Funktioniert **offline**. Der Fortschritt bleibt auf dem Gerät (localStorage `capy-mathe-v1`).

## Aufs iPad
1. In Safari die Adresse öffnen: `https://jonathanbasler-a11y.github.io/Schule-emma/`
2. Teilen → „Zum Home-Bildschirm“

## Entwicklung
- `public/aufgaben.js`: Aufgaben-Generatoren (laufen im Browser und in Node)
- `public/capy.js`: Mochi, Orte, Sprüche, Klänge, Musik
- `public/app.js`: Oberfläche
- `public/style.css`: Gestaltung
- Tests:
  - `node tools/test-aufgaben.mjs`
  - `node tools/e2e.mjs [screenshot-ordner]`
  - `node tools/test-offline.mjs`
  - Für die Browser-Tests wird Playwright mit Chromium gebraucht.
- Bei jedem Push auf `main` laufen die Tests. Danach wird mit GitHub Pages veröffentlicht. Dafür muss in den Repo-Einstellungen unter Pages einmal „GitHub Actions“ als Quelle gewählt sein.
