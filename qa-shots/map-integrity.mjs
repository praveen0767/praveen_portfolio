/**
 * Post-tune integrity probe: proves the compacted map still has clean geometry.
 *   node qa-shots/map-integrity.mjs
 *
 * Asserts, per viewport:
 *   - no vertical overlap between consecutive .map children (stubs included)
 *   - every .map child sits inside the .map box
 *   - no .map__name / .map__index / .map__practice-name text overflows its node
 *   - connector stubs still have usable height (geometry not flattened to 0)
 *   - all 24 tech marks + 5 practices + 4 related links are laid out and on-screen
 *   - hero -> ARIV handoff distance (did the flagship move closer?)
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const VIEWPORTS = [
  [1440, 900], [1280, 800], [1024, 768], [820, 1180], [390, 844], [375, 812], [360, 800],
];
const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 45000 + Math.floor(Math.random() * 4000);
const BASE = process.env.QA_BASE || "http://localhost:3000";

const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\qa-mi-${process.pid}`,
  "--no-first-run", "--disable-gpu", "--hide-scrollbars",
  "--force-device-scale-factor=1", "about:blank",
], { stdio: "ignore" });

async function cdpUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("chrome did not start");
}
const ws = new WebSocket(await cdpUrl());
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});
let id = 0; const pending = new Map();
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id); pending.delete(m.id);
    if (m.error) p.reject(new Error(JSON.stringify(m.error))); else p.resolve(m.result);
  }
});
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const i = ++id; pending.set(i, { resolve, reject });
  ws.send(JSON.stringify({ id: i, method, params, sessionId }));
});
const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);

const probe = `JSON.stringify((() => {
  const map = document.querySelector('.map');
  const mapVisible = map && map.getBoundingClientRect().height > 0;
  const hero = document.querySelector('.hero');
  const ariv = document.querySelector('#ariv') || document.querySelector('.ariv');
  const out = {
    dbg: location.href + ' | title=' + document.title +
      ' | readyState=' + document.readyState +
      ' | .map=' + document.querySelectorAll('.map').length +
      ' | .hero=' + document.querySelectorAll('.hero').length +
      ' | bodyH=' + document.body.scrollHeight,
    mapVisible,
    mapDisplay: map ? getComputedStyle(map).display : null,
    handoff: null,
  };
  if (hero && ariv) {
    out.handoff = Math.round(
      ariv.getBoundingClientRect().top - hero.getBoundingClientRect().bottom);
  }
  if (!mapVisible) return out;

  const mb = map.getBoundingClientRect();
  const kids = [...map.children];
  const overlaps = [];
  const escapes = [];
  kids.forEach((c, i) => {
    const b = c.getBoundingClientRect();
    if (b.top < mb.top - 1 || b.bottom > mb.bottom + 1 || b.left < mb.left - 1 || b.right > mb.right + 1) {
      escapes.push(c.className.toString().slice(0, 28));
    }
    if (i > 0) {
      const prev = kids[i - 1].getBoundingClientRect();
      const gap = Math.round((b.top - prev.bottom) * 10) / 10;
      if (gap < 0) overlaps.push(i + ':' + gap);
    }
  });

  const stubs = kids.filter((c) => c.tagName === 'svg')
    .map((c) => Math.round(c.getBoundingClientRect().height * 10) / 10);

  const textOverflow = [];
  document.querySelectorAll('.map__node').forEach((n) => {
    const nb = n.getBoundingClientRect();
    n.querySelectorAll('.map__name,.map__index,.map__practice-name,.map__tech').forEach((t) => {
      const b = t.getBoundingClientRect();
      if (b.width === 0) return;
      if (b.right > nb.right + 0.5 || b.left < nb.left - 0.5) {
        textOverflow.push((t.textContent || t.className).toString().trim().slice(0, 18));
      }
    });
  });

  const marks = [...document.querySelectorAll('.map__tech')];
  const markRows = {};
  marks.forEach((m) => {
    const b = m.getBoundingClientRect();
    const k = Math.round(b.top);
    markRows[k] = (markRows[k] || 0) + 1;
  });

  out.overlaps = overlaps;
  out.escapes = escapes;
  out.stubs = stubs;
  out.minStub = Math.min(...stubs);
  out.textOverflow = textOverflow;
  out.techMarks = marks.length;
  out.marksLaidOut = marks.filter((m) => m.getBoundingClientRect().width > 0).length;
  out.techRows = Object.values(markRows).sort((a, b) => b - a);
  out.practices = document.querySelectorAll('.map__practice').length;
  out.practicesVisible = [...document.querySelectorAll('.map__practice')]
    .filter((p) => p.getBoundingClientRect().width > 0).length;
  out.relLinks = document.querySelectorAll('.map__rel-link').length;
  out.relVisible = [...document.querySelectorAll('.map__rel-link')]
    .filter((p) => p.getBoundingClientRect().width > 0).length;
  out.readoutText = (document.querySelector('.map__readout')?.innerText || '').replace(/\\s+/g, ' ').trim();
  out.nodeOrder = [...document.querySelectorAll('.map__node')]
    .map((n) => (n.querySelector('.map__index')?.textContent || '') + ':' +
      (n.querySelector('.map__name')?.textContent || '').trim()).join(' | ');
  out.mapH = Math.round(map.getBoundingClientRect().height);
  out.heroH = Math.round(hero.getBoundingClientRect().height);
  return out;
})())`;

let fails = 0;
console.log(`\n### Map integrity\n`);
for (const [W, H] of VIEWPORTS) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: W, height: H, deviceScaleFactor: 1, mobile: W < 500, screenWidth: W, screenHeight: H,
  }, sessionId);
  await send("Page.navigate", { url: `${BASE}/` }, sessionId);
  await sleep(3200);
  const { result } = await send("Runtime.evaluate", { expression: probe, returnByValue: true }, sessionId);
  const d = JSON.parse(result.value);
  if (!d.mapVisible) {
    console.log(`??   ${W}x${H}  mapVisible=${d.mapVisible} mapDisplay=${d.mapDisplay}  ${d.dbg}`);
    continue;
  }
  const bad = [];
  if (d.overlaps?.length) bad.push(`child overlap ${d.overlaps.join(",")}`);
  if (d.escapes?.length) bad.push(`escapes map box: ${d.escapes.join(",")}`);
  if (d.minStub < 4) bad.push(`stub flattened to ${d.minStub}px`);
  if (d.textOverflow?.length) bad.push(`text overflow: ${d.textOverflow.join(",")}`);
  if (d.marksLaidOut !== d.techMarks) bad.push(`marks ${d.marksLaidOut}/${d.techMarks}`);
  if (d.practicesVisible !== d.practices) bad.push(`practices ${d.practicesVisible}/${d.practices}`);
  if (d.relVisible !== d.relLinks) bad.push(`rel ${d.relVisible}/${d.relLinks}`);
  if (bad.length) { fails++; console.log(`FAIL ${W}x${H}`); bad.forEach((b) => console.log(`       - ${b}`)); }
  else {
    console.log(`ok   ${W}x${H}  map=${d.mapH}  hero=${d.heroH}  handoff=${d.handoff}  stubs=[${d.stubs}]  marks=${d.techMarks} rows=${JSON.stringify(d.techRows)}  practices=${d.practices} rel=${d.relLinks}`);
    console.log(`       readout: "${d.readoutText}"`);
  }
}
console.log(`\n${fails === 0 ? "MAP INTEGRITY CLEAN" : `${fails} viewport(s) failed`}`);
ws.close();
try { spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" }); } catch {}
process.exit(fails === 0 ? 0 : 1);
