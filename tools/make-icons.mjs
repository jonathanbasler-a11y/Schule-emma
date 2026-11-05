// Erzeugt die App-Icons aus Mochi (SVG) mit Playwright. Aufruf: node tools/make-icons.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
globalThis.self = globalThis;
require("../public/capy.js");
const svg = globalThis.Capy.mochi("calm", [], 400);
const b = await chromium.launch();
for (const s of [180, 192, 512]) {
  const p = await b.newPage({ viewport: { width: s, height: s } });
  await p.setContent(`<html><body style="margin:0"><div style="width:${s}px;height:${s}px;background:radial-gradient(circle at 50% 40%,#f6e6c0,#e9c08f);display:grid;place-items:center"><div style="width:${s * 0.84}px;height:${s * 0.84}px;margin-top:${s * 0.06}px">${svg.replace(/width="400" height="400"/, 'width="100%" height="100%"')}</div></div><style>${fs.readFileSync("public/style.css", "utf8").match(/\/\* Mochi \*\/[\s\S]*?@keyframes breathe/)[0].replace("@keyframes breathe", "")} .mochi *{animation:none!important}</style></body></html>`);
  await p.screenshot({ path: `public/icons/icon-${s}.png` });
  await p.close();
}
await b.close();
console.log("icons ok");
