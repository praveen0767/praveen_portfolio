/**
 * Focused: is the 1440px "INFRASTRUCTURE" overflow pre-existing or introduced
 * by the map compaction?  node qa-shots/infra-overflow.mjs
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 45000 + Math.floor(Math.random() * 4000);
const BASE = process.env.QA_BASE || "http://localhost:3100";

const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\qa-inf-${process.pid}`,
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
  throw new Error("no chrome");
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
  const rows = [...document.querySelectorAll('.map__node')].map((n) => {
    const nb = n.getBoundingClientRect();
    const name = n.querySelector('.map__name');
    const cs = getComputedStyle(n);
    // intrinsic single-line width of the unbreakable word
    const span = document.createElement('span');
    span.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;';
    span.style.font = getComputedStyle(name).font || '';
    span.style.fontFamily = getComputedStyle(name).fontFamily;
    span.style.fontSize = getComputedStyle(name).fontSize;
    span.style.fontWeight = getComputedStyle(name).fontWeight;
    span.style.letterSpacing = getComputedStyle(name).letterSpacing;
    span.style.textTransform = getComputedStyle(name).textTransform;
    span.textContent = name.textContent.trim();
    document.body.appendChild(span);
    const intrinsic = span.getBoundingClientRect().width;
    span.remove();

    const contentW = nb.width
      - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
    const nb1 = name.getBoundingClientRect();
    return {
      label: name.textContent.trim(),
      fs: getComputedStyle(name).fontSize,
      nodeW: Math.round(nb.width * 10) / 10,
      padX: [cs.paddingLeft, cs.paddingRight],
      contentW: Math.round(contentW * 10) / 10,
      intrinsic: Math.round(intrinsic * 10) / 10,
      overflowBy: Math.round((intrinsic - contentW) * 10) / 10,
      renderedRight: Math.round(nb1.right * 10) / 10,
      nodeRight: Math.round(nb.right * 10) / 10,
      spills: Math.round((nb1.right - nb.right) * 10) / 10,
    };
  });
  return { rows };
})())`;

for (const [W, H] of [[1440, 900], [1280, 800]]) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: W, height: H, deviceScaleFactor: 1, mobile: false, screenWidth: W, screenHeight: H,
  }, sessionId);
  await send("Page.navigate", { url: `${BASE}/` }, sessionId);
  await sleep(3000);
  const { result } = await send("Runtime.evaluate", { expression: probe, returnByValue: true }, sessionId);
  const d = JSON.parse(result.value);
  console.log(`\n=== ${W}x${H} ===`);
  for (const r of d.rows) {
    const flag = r.spills > 0.5 ? "  <-- SPILLS" : "";
    console.log(
      `  ${r.label.padEnd(15)} fs=${String(r.fs).padStart(8)} nodeW=${String(r.nodeW).padStart(6)} ` +
      `padX=${r.padX[0]}/${r.padX[1]} contentW=${String(r.contentW).padStart(6)} ` +
      `intrinsic=${String(r.intrinsic).padStart(6)} overflowBy=${String(r.overflowBy).padStart(6)} spills=${r.spills}${flag}`,
    );
  }
}

ws.close();
try { spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" }); } catch {}
process.exit(0);
