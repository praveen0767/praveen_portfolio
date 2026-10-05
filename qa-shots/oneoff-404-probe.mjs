/** One-off: list HTTP responses with status >= 400 per route (prod server). */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 51000 + Math.floor(Math.random() * 2000);
const BASE = process.env.QA_BASE || "http://localhost:3000";
/* NB: pass routes as WORDS without a leading slash (the shell mangles slash
   args); they are prefixed with "/" here. */
const ROUTES = process.argv.slice(2).map((r) => (r.startsWith("/") ? r : `/${r}`));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-oneoff-${process.pid}`,
    "--no-first-run",
    "--disable-gpu",
    "--hide-scrollbars",
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
const listeners = [];
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(new Error(JSON.stringify(m.error)));
    else p.resolve(m.result);
    return;
  }
  for (const fn of listeners) fn(m);
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
await send("Network.enable", {}, sessionId);

const bad = [];
listeners.push((m) => {
  if (m.method === "Network.responseReceived") {
    const { response } = m.params;
    if (response.status >= 400) bad.push(`${response.status} ${response.url}`);
  }
  if (m.method === "Network.loadingFailed") {
    bad.push(`FAILED ${m.params.errorText} ${m.params.blockedReason || ""}`);
  }
});

for (const route of ROUTES) {
  bad.length = 0;
  await send("Page.navigate", { url: `${BASE}${route}` }, sessionId);
  await sleep(3000);
  console.log(`\n${route}:`);
  if (!bad.length) console.log("  (no failed responses)");
  for (const b of [...new Set(bad)]) console.log(`  ${b}`);
}

ws.close();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}
process.exit(0);
