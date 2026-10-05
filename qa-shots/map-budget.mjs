/**
 * One-off: dump the FDE map's internal vertical budget at desktop widths.
 *   node qa-shots/map-budget.mjs
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 45000 + Math.floor(Math.random() * 4000);
const BASE = process.env.QA_BASE || "http://localhost:3000";

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-mb-${process.pid}`,
    "--no-first-run",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "about:blank",
  ],
  { stdio: "ignore" },
);

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
let id = 0;
const pending = new Map();
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(new Error(JSON.stringify(m.error)));
    else p.resolve(m.result);
  }
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const i = ++id;
    pending.set(i, { resolve, reject });
    ws.send(JSON.stringify({ id: i, method, params, sessionId }));
  });

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);

const probe = `JSON.stringify((() => {
  const map = document.querySelector('.map');
  const cs = getComputedStyle(map);
  const rows = [...map.children].map((c) => {
    const b = c.getBoundingClientRect();
    const s = getComputedStyle(c);
    return {
      cls: c.className.toString().slice(0, 40),
      h: Math.round(b.height * 10) / 10,
      pt: s.paddingTop, pb: s.paddingBottom,
      kids: [...c.children].map((k) => {
        const kb = k.getBoundingClientRect();
        return {
          cls: k.className.toString().slice(0, 34),
          h: Math.round(kb.height * 10) / 10,
          rows: getComputedStyle(k).gridTemplateRows,
        };
      }),
    };
  });
  const nodeInfo = (n) => {
    const s = getComputedStyle(n);
    const b = n.getBoundingClientRect();
    const core = n.querySelector('.map__core');
    const tech = n.querySelector('.map__tech');
    const prac = n.querySelector('.map__practice');
    return {
      label: (n.querySelector('.map__name')?.textContent || '').trim().slice(0, 14),
      h: Math.round(b.height * 10) / 10,
      pt: s.paddingTop, pb: s.paddingBottom, gap: s.rowGap,
      coreH: core ? Math.round(core.getBoundingClientRect().height * 10) / 10 : null,
      techRows: n.querySelector('.map__techs')
        ? getComputedStyle(n.querySelector('.map__techs')).gridTemplateRows
        : null,
      techCount: n.querySelectorAll('.map__tech').length,
      techSize: tech ? tech.getBoundingClientRect().width : null,
      pracCount: n.querySelectorAll('.map__practice').length,
      pracSize: prac ? Math.round(prac.getBoundingClientRect().height * 10) / 10 : null,
    };
  };
  const readout = document.querySelector('.map__readout');
  const readoutVal = document.querySelector('.map__readout-val');
  const projects = document.querySelector('.map__projects');
  return {
    mapH: Math.round(map.getBoundingClientRect().height * 10) / 10,
    mapPad: [cs.paddingTop, cs.paddingBottom],
    mapGap: cs.rowGap,
    childCount: map.children.length,
    gapTotal: Math.round(parseFloat(cs.rowGap) * (map.children.length - 1) * 10) / 10,
    rows,
    nodes: [...document.querySelectorAll('.map__node')].map(nodeInfo),
    readout: {
      h: Math.round(readout.getBoundingClientRect().height * 10) / 10,
      mh: getComputedStyle(readout).minHeight,
      valH: Math.round(readoutVal.getBoundingClientRect().height * 10) / 10,
      lh: getComputedStyle(readout).lineHeight,
      valFs: getComputedStyle(readoutVal).fontSize,
      valW: Math.round(readoutVal.getBoundingClientRect().width),
    },
    projects: {
      h: Math.round(projects.getBoundingClientRect().height * 10) / 10,
      mh: getComputedStyle(projects).minHeight,
      pt: getComputedStyle(projects).paddingTop,
      rows: getComputedStyle(projects).gridTemplateRows,
      linkH: Math.round(document.querySelector('.map__rel-link').getBoundingClientRect().height * 10) / 10,
    },
    consoleH: Math.round(document.querySelector('.map__console').getBoundingClientRect().height * 10) / 10,
    consolePad: getComputedStyle(document.querySelector('.map__console')).paddingTop,
    consoleMt: getComputedStyle(document.querySelector('.map__console')).marginTop,
    consoleGap: getComputedStyle(document.querySelector('.map__console')).rowGap,
    deskPlaneW: Math.round(document.querySelector('.desk__plane--map').getBoundingClientRect().width),
    deskW: Math.round(document.querySelector('.desk').getBoundingClientRect().width),
    headerH: document.querySelector('header')?.getBoundingClientRect().height,
  };
})())`;

for (const [W, H] of [[1440, 900], [1280, 800], [1024, 768], [820, 1180]]) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: W, height: H, deviceScaleFactor: 1, mobile: false, screenWidth: W, screenHeight: H,
  }, sessionId);
  await send("Page.navigate", { url: `${BASE}/` }, sessionId);
  await sleep(3000);
  const { result } = await send("Runtime.evaluate", { expression: probe, returnByValue: true }, sessionId);
  const d = JSON.parse(result.value);
  console.log(`\n===== ${W}x${H}  deskW=${d.deskW} mapPlaneW=${d.deskPlaneW} headerH=${d.headerH} =====`);
  console.log(`map h=${d.mapH}  pad=[${d.mapPad.join(", ")}]  gap=${d.mapGap}  children=${d.childCount}  gapTotal=${d.gapTotal}`);
  for (const r of d.rows) {
    console.log(`  ${String(r.h).padStart(6)}  ${r.cls}`);
    for (const k of r.kids) console.log(`         ${String(k.h).padStart(6)}  ${k.cls}  rows=${k.rows}`);
  }
  console.log(`console h=${d.consoleH} padT=${d.consolePad} mt=${d.consoleMt} gap=${d.consoleGap}`);
  console.log(`  readout ${JSON.stringify(d.readout)}`);
  console.log(`  projects ${JSON.stringify(d.projects)}`);
  console.log(`nodes:`);
  for (const n of d.nodes) console.log(`   ${JSON.stringify(n)}`);
}

ws.close();
try { spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" }); } catch {}
process.exit(0);
