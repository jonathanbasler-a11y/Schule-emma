# Vorlagen für `app-auf-github-pages`

## Workflow `.github/workflows/pages.yml`
```yaml
name: Veröffentlichen
on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages-${{ github.ref }}
  cancel-in-progress: true
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Aufgaben-Logik
        run: node tools/test-aufgaben.mjs 300
      - name: Browser installieren
        run: |
          npm install --no-save playwright@1.63.0
          npx playwright install --with-deps chromium
      - name: Browser-Test
        run: node tools/e2e.mjs
      - name: Offline
        run: node tools/test-offline.mjs
  deploy:
    needs: test
    if: github.event_name != 'pull_request'
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: public
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Nachricht an die Eltern: Einmalig vorher
> Bevor die App online gehen kann, musst du einmal etwas bei GitHub einstellen:
> 1. Öffne `https://github.com/<benutzer>/<repo>/settings/pages`
> 2. Wähle bei **Source** den Eintrag **„GitHub Actions“**.
>
> Mehr ist nicht nötig. Ich melde mich, wenn die Tests grün sind. Dann klickst du noch einmal.

## Nachricht an die Eltern: Zum Merge (erst wenn alle Tests grün sind)
> Die Tests sind grün. Jetzt bist du dran:
> 1. Öffne `https://github.com/<benutzer>/<repo>/pull/<nummer>`
> 2. Klicke auf **„Ready for review“** (nur nötig, wenn dort „Draft“ steht).
> 3. Klicke auf **„Merge pull request“** und dann auf **„Confirm merge“**.
> 4. Nach etwa 1–2 Minuten ist die neue Version online. Ich schaue noch nach, ob es geklappt hat.

## Nachricht an die Eltern: Aufs iPad
> 1. Öffne in **Safari** die Adresse `https://<benutzer>.github.io/<repo>/`
> 2. Tippe auf **Teilen** (Quadrat mit Pfeil) → **„Zum Home-Bildschirm“**.
> 3. Bei einer neuen Version: App **ganz schließen** (nach oben wegwischen) und neu öffnen. Wenn noch die alte Version erscheint, ein zweites Mal.

## Nach dem Merge selbst prüfen
- Lauf auf `main` suchen (Event `push`): `test` und `deploy` müssen `success` sein.
- Erst dann melden: „Online. Die Seite konnte ich von hier aus nicht öffnen. Gewissheit gibt dein iPad.“
- Eine Erinnerung für ein paar Minuten später setzen, falls die Veröffentlichung noch läuft.

## `sw.js` (Offline)
```js
const CACHE = "app-v1"; // bei jeder sichtbaren Änderung hochzählen
const FILES = ["./", "index.html", "style.css", "aufgaben.js", "app.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((n) => Promise.all(n.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const slow = new Promise((_, no) => setTimeout(() => no(new Error("langsam")), 4000));
      const r = await Promise.race([fetch(e.request, { cache: "no-cache" }), slow]);
      if (r && r.ok) c.put(e.request, r.clone());
      return r;
    } catch (err) { const hit = await c.match(e.request, { ignoreSearch: true }); if (hit) return hit; throw err; }
  })());
});
```
