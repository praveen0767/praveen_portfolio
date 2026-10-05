/**
 * Duplicate-FDE audit + section-flow probe (dev-only QA tooling).
 *
 *   node qa-shots/fde-audit.mjs
 *
 * Loads the homepage at the viewports the brief requires and asserts:
 *   - the removed "7-Layer FDE Capability Map" block never renders
 *   - the canonical FDE capability map mounts exactly once
 *   - no duplicate element ids / dangling aria references
 *   - no horizontal overflow and no console errors
 *   - the section after "Open the work archive" is the next intended section
 *     (no dead gap left behind by the removal)
 *
 * Screenshots land in qa-shots/fde-<viewport>.png for eyeballing.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { writeFileSync } from "node:fs";

const VIEWPORTS = [
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [820, 1180],
  [390, 844],
  [375, 812],
  [360, 800],
];

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 45000 + Math.floor(Math.random() * 4000);
const BASE = process.env.QA_BASE || "http://localhost:3000";

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-fde-${process.pid}`,
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
await send("Runtime.enable", {}, sessionId);
await send("Log.enable", {}, sessionId);

const probe = `JSON.stringify((() => {
  const text = document.body.innerText;
  const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
  const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
  const aria = [...document.querySelectorAll('[aria-controls],[aria-labelledby]')].flatMap((el) =>
    (el.getAttribute('aria-controls') || '').split(/\\s+/)
      .concat((el.getAttribute('aria-labelledby') || '').split(/\\s+/)),
  ).filter(Boolean);
  const sections = [...document.querySelectorAll('main section')].map((s) => ({
    id: s.id || s.className.split(' ')[0],
    top: Math.round(s.getBoundingClientRect().top + window.scrollY),
    height: Math.round(s.getBoundingClientRect().height),
  })).sort((a, b) => a.top - b.top);
  const archive = [...document.querySelectorAll('a,button')].find((el) =>
    (el.innerText || '').includes('Open the work archive'),
  );
  const after = archive
    ? sections.find((s) => s.top > archive.getBoundingClientRect().top + window.scrollY)
    : null;
  const afterSection = after ? document.getElementById(after.id) : null;
  const archiveBottom = archive
    ? Math.round(archive.getBoundingClientRect().bottom + window.scrollY)
    : 0;
  const gap = afterSection && archiveBottom
    ? after.top - archiveBottom
    : null;
  return {
    dupeHeading: (text.toUpperCase().match(/7-LAYER FDE CAPABILITY MAP/g) || []).length,
    dupeMarkers: document.querySelectorAll('.mobile-fde-system, [id="capabilities"]').length,
    mapCount: document.querySelectorAll('.map').length,
    mapLabelCount: [...document.querySelectorAll('.map__label')].filter(
      (el) => (el.textContent || '').split(/[^A-Za-z]+/).join(' ').trim() === 'FDE capability system',
    ).length,
    duplicateIds: [...new Set(dupes)],
    danglingAria: aria.filter((a) => a && !ids.includes(a)),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    sections: sections.map((s) => s.id),
    archiveToNext: { next: after ? after.id : null, gap },
    docHeight: document.documentElement.scrollHeight,
  };
})())`;

let failures = 0;
console.log("\n### FDE duplicate audit\n");

for (const [W, H] of VIEWPORTS) {
  const errors = [];
  const onEvent = (m) => {
    if (m.sessionId && m.sessionId !== sessionId) return;
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
      errors.push((m.params.args || []).map((a) => a.value ?? a.description ?? "").join(" "));
    }
    if (m.method === "Runtime.exceptionThrown") {
      errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    }
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error") {
      errors.push(m.params.entry.text);
    }
  };
  listeners.push(onEvent);

  await send("Emulation.setDeviceMetricsOverride", {
    width: W,
    height: H,
    deviceScaleFactor: 1,
    mobile: W < 500,
    screenWidth: W,
    screenHeight: H,
  }, sessionId);
  await send("Page.navigate", { url: `${BASE}/` }, sessionId);
  await sleep(3000);

  const { result, exceptionDetails } = await send(
    "Runtime.evaluate",
    { expression: probe, returnByValue: true },
    sessionId,
  );
  const idx = listeners.indexOf(onEvent);
  if (idx >= 0) listeners.splice(idx, 1);

  if (exceptionDetails) {
    console.log(`FAIL ${W}x${H}  probe error: ${exceptionDetails.text}`);
    failures++;
    continue;
  }

  const d = JSON.parse(result.value);
  const problems = [];
  if (d.dupeHeading !== 0) problems.push(`"7-Layer FDE Capability Map" x${d.dupeHeading}`);
  if (d.dupeMarkers !== 0) problems.push(`duplicate block markers x${d.dupeMarkers}`);
  if (d.mapCount !== 1) problems.push(`canonical map x${d.mapCount}`);
  if (d.mapLabelCount !== 1) problems.push(`map label x${d.mapLabelCount}`);
  if (d.duplicateIds.length) problems.push(`duplicate ids: ${d.duplicateIds.join(", ")}`);
  if (d.danglingAria.length) problems.push(`dangling aria: ${d.danglingAria.join(", ")}`);
  if (d.overflow > 1) problems.push(`horizontal overflow ${d.overflow}px`);
  if (d.archiveToNext.next !== "toolkit") {
    problems.push(`section after work archive: ${d.archiveToNext.next}`);
  }
  if (d.archiveToNext.gap !== null && (d.archiveToNext.gap < -500 || d.archiveToNext.gap > 400)) {
    problems.push(`dead gap ${d.archiveToNext.gap}px before next section`);
  }
  for (const e of errors) problems.push(`console: ${String(e).slice(0, 140)}`);

  const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  writeFileSync(`qa-shots/fde-${W}x${H}.png`, Buffer.from(shot.data, "base64"));

  if (problems.length) {
    failures++;
    console.log(`FAIL ${W}x${H}`);
    for (const p of problems) console.log(`       - ${p}`);
  } else {
    console.log(
      `ok   ${W}x${H}  map x1, no duplicate, overflow 0, ` +
        `archive → ${d.archiveToNext.next} (gap ${d.archiveToNext.gap}px), ${d.docHeight}px tall`,
    );
  }
}

console.log(`\n${failures === 0 ? "VIEWPORTS CLEAN" : `${failures} viewport(s) failed`}`);
ws.close();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}
process.exit(failures === 0 ? 0 : 1);
