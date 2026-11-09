---
name: app-auf-github-pages
description: Bringt eine fertige Web-App (PWA im Ordner public/) über GitHub Pages aufs iPad, mit Tests in GitHub Actions, Pull Request und einer Klick-für-Klick-Anleitung für Eltern. Verwenden, wenn eine App veröffentlicht, gemergt, aktualisiert oder auf dem iPad installiert werden soll, oder wenn ein Merge, Pages oder die Veröffentlichung nicht klappt.
---

# App auf GitHub Pages veröffentlichen

Die Eltern sind keine Techniker. Du darfst nichts selbst mergen und keine Repo-Einstellungen ändern. Sag ihnen die Klicks **einzeln und in der richtigen Reihenfolge**, auf Deutsch, wenn sie Deutsch schreiben.

## Ablauf
1. **Repo vorbereiten.** Ein leeres Repo bekommt zuerst einen Commit mit `README.md` direkt auf `main`, sonst hat ein Pull Request keine Basis.
2. **Branch** `claude/<thema>` von `main`. Die Basis jedes PR ist **immer `main`**.
3. **Workflow** `.github/workflows/pages.yml` (Muster in `anleitung-eltern.md`): Tests bei jedem Push und PR, Veröffentlichung nur bei Push auf `main` und erst nach grünen Tests. Berechtigungen: `contents: read`, `pages: write`, `id-token: write`.
4. **Vor dem ersten Merge** den Eltern sagen, was sie einmal von Hand tun müssen: im Repo *Settings → Pages → Source* auf **„GitHub Actions“** stellen. Das geht nicht von hier.
5. **Pull Request als Entwurf** anlegen (Draft, Body nach `.github/pull_request_template.md`, falls vorhanden) und beobachten. Bei roten Tests selbst beheben.
6. **Erst wenn alle Tests grün sind**, die Eltern bitten: *Ready for review* → *Merge pull request* → *Confirm merge*. Nicht vorher.
7. **Nach dem Merge nachsehen:** Der Lauf auf `main` muss `test` und `deploy` mit `success` haben. Erst dann die Adresse nennen: `https://<benutzer>.github.io/<repo>/`.
8. **Aufs iPad:** Safari → Adresse öffnen → Teilen → „Zum Home-Bildschirm“. Bei einer neuen Version die App ganz schließen und neu öffnen, notfalls zweimal.

## Lehren aus der Praxis
- **Falscher Basis-Branch:** Ein PR landete in einem Zwischen-Branch statt in `main`, und die Änderung ging nie online. Vor jedem PR die Basis prüfen. Nach dem Merge eines Zwischen-Branches ist er zu löschen.
- **Zu früh gemergt:** Wenn die Eltern einen PR mergen, während du noch einen Commit auf demselben Branch hast, fehlt dieser Commit. Nach „bereit zum Merge“ **nichts mehr auf diesen Branch pushen**. Nachträge als **neuer Branch und neuer PR** aus dem aktuellen `main`.
- **Force-Push ist hier gesperrt.** Statt einen Branch umzuschreiben, einen neuen Branch aus `main` nehmen und den Commit mit `git cherry-pick` übernehmen.
- **Repo umbenannt:** Meldet Git beim Push „This repository moved“, die Remote-Adresse auf den neuen Namen setzen (`git remote set-url`). Der GitHub-Zugriff läuft über den Namen in der Sitzung, nicht über die alte Adresse.
- **Prüfen statt behaupten:** Die Live-Seite lässt sich von der Cloud-Umgebung aus meist nicht öffnen (Proxy). Das ehrlich sagen und die Gewissheit über den Lauf (`deploy: success`) und das iPad der Eltern holen.
- **Cache im iPad:** Bei jeder sichtbaren Änderung den Namen in `sw.js` hochzählen (`CACHE = "app-v3"`), sonst sieht das Kind die alte Version.
- **Erinnerung setzen:** Nach dem Merge einen Check in wenigen Minuten einplanen, damit du nachsiehst, statt zu raten.
- **PR-Benachrichtigungen:** Nach dem Anlegen eines PR sofort die Aktivität abonnieren, damit rote Tests auffallen.

## Wenn etwas nicht klappt
| Symptom | Ursache und Lösung |
|---|---|
| Lauf endet mit „deploy skipped“ | Es war ein PR-Lauf. Die Veröffentlichung läuft nur auf `main`. |
| `deploy` schlägt fehl mit Hinweis auf Pages | Pages-Quelle ist nicht auf „GitHub Actions“ gestellt. Eltern bitten, es zu tun, und den Lauf erneut starten lassen (*Re-run jobs*). |
| Seite zeigt 404 | Pages ist noch nicht aktiv oder der Pfad stimmt nicht (`start_url` und `scope` im Manifest müssen relativ sein, `./`). |
| Alte Version auf dem iPad | App ganz schließen, neu öffnen. `CACHE`-Name hochgezählt? |
| PR kann nicht gemergt werden | Konflikt oder Tests rot. Basis in `main` hineinmergen und beheben. |
| Merge ohne den letzten Commit | Siehe „Zu früh gemergt“: neuer Branch, neuer PR. |

## Anleitung für die Eltern
Eine Vorlage zum Kopieren steht in `anleitung-eltern.md`.
