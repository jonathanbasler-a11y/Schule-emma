# Capy & Mathe

Lern-App fürs iPad für Emmas erste Mathe-Klassenarbeit in Klasse 5 (Gymnasium BW, Kapitel I „Die natürlichen Zahlen“). Mochi, das Capybara, übt mit ihr.

## Was die App kann
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
