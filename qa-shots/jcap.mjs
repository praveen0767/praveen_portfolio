import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 48000 + Math.floor(Math.random() * 9000);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/jcap-${process.pid}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
async function cdp(){for(let i=0;i<60;i++){try{const r=await fetch(`http://127.0.0.1:${PORT}/json/version`);if(r.ok)return (await r.json()).webSocketDebuggerUrl;}catch{}await sleep(250);}throw new Error("no chrome");}
const ws = new WebSocket(await cdp());
await new Promise((res,rej)=>{ws.addEventListener("open",res,{once:true});ws.addEventListener("error",rej,{once:true});});
let id=0;const pending=new Map();
ws.addEventListener("message",(ev)=>{const m=JSON.parse(ev.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(new Error(JSON.stringify(m.error)));else p.resolve(m.result);}});
const send=(m,p={},s)=>new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}));});
const {targetId}=await send("Target.createTarget",{url:"about:blank"});
const {sessionId}=await send("Target.attachToTarget",{targetId,flatten:true});
await send("Page.enable",{},sessionId);await send("Runtime.enable",{},sessionId);
await send("Network.setCacheDisabled",{cacheDisabled:true},sessionId);
const [w,h,y,name] = [Number(process.argv[2]), Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
await send("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:1,mobile:w<500,screenWidth:w,screenHeight:h},sessionId);
await send("Page.navigate",{url:`http://localhost:3000${process.env.ROUTE||"/"}`},sessionId);
await sleep(2500);
const THEME = process.env.THEME;
if (THEME) {
  await send("Runtime.evaluate",{expression:`localStorage.setItem('praveen-theme', ${JSON.stringify(THEME)}); document.documentElement.setAttribute('data-theme', ${JSON.stringify(THEME)}); true`},sessionId);
  await sleep(400);
}
await send("Runtime.evaluate",{expression:`window.scrollTo({top:${y},behavior:'instant'})`},sessionId);
await sleep(900);
await send("Runtime.evaluate",{expression:`(()=>{const d=document.createElement('div');d.id='jcap';d.textContent='JCAP ${w}x${h} @ ${y}';d.style.cssText='position:fixed;right:6px;bottom:6px;z-index:2147483647;background:#ff00ff;color:#fff;font:bold 13px monospace;padding:3px 7px';document.body.appendChild(d);return true})()`},sessionId);
await sleep(200);
const shot=await send("Page.captureScreenshot",{format:"jpeg",quality:80},sessionId);
writeFileSync(`qa-shots/${name}.jpg`, Buffer.from(shot.data,"base64"));
console.log("wrote", name);
ws.close();chrome.kill();
try{spawn("taskkill",["/PID",String(chrome.pid),"/T","/F"],{stdio:"ignore"});}catch{}
