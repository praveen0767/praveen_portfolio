import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 31000 + Math.floor(Math.random() * 8000);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/insp-${process.pid}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
async function cdp(){for(let i=0;i<60;i++){try{const r=await fetch(`http://127.0.0.1:${PORT}/json/version`);if(r.ok)return (await r.json()).webSocketDebuggerUrl;}catch{}await sleep(250);}throw new Error("no chrome");}
const ws=new WebSocket(await cdp());
await new Promise((res,rej)=>{ws.addEventListener("open",res,{once:true});ws.addEventListener("error",rej,{once:true});});
let id=0;const pending=new Map();
ws.addEventListener("message",(ev)=>{const m=JSON.parse(ev.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(new Error(JSON.stringify(m.error)));else p.resolve(m.result);}});
const send=(m,p={},s)=>new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}));});
const {targetId}=await send("Target.createTarget",{url:"about:blank"});
const {sessionId}=await send("Target.attachToTarget",{targetId,flatten:true});
await send("Page.enable",{},sessionId);await send("Runtime.enable",{},sessionId);
const W=Number(process.argv[2]||1440),H=Number(process.argv[3]||900);
await send("Emulation.setDeviceMetricsOverride",{width:W,height:H,deviceScaleFactor:1,mobile:false,screenWidth:W,screenHeight:H},sessionId);
await send("Page.navigate",{url:"http://localhost:3000/"},sessionId);
await sleep(2600);
const out=await send("Runtime.evaluate",{expression:`JSON.stringify((()=>{
  const over = [];
  for (const el of document.querySelectorAll('*')) {
    const b = el.getBoundingClientRect();
    if (b.right > window.innerWidth + 5 || b.left < -5) {
      over.push({
        tag: el.tagName,
        cls: el.className,
        id: el.id,
        left: Math.round(b.left),
        right: Math.round(b.right),
        width: Math.round(b.width)
      });
    }
  }

  return {
    bodyScrollWidth: document.body.scrollWidth,
    docScrollWidth: document.documentElement.scrollWidth,
    docOverflowX: getComputedStyle(document.documentElement).overflowX,
    bodyOverflowX: getComputedStyle(document.body).overflowX,
    windowWidth: window.innerWidth,
    canScrollHorizontally: document.documentElement.scrollWidth > window.innerWidth,
    over: over.slice(0, 15)
  };
})())`,returnByValue:true},sessionId);
console.log(out.result.value);
ws.close();chrome.kill();
try{spawn("taskkill",["/PID",String(chrome.pid),"/T","/F"],{stdio:"ignore"});}catch{}
