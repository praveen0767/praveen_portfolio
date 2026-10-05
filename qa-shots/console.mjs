import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 44000 + Math.floor(Math.random() * 5000);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/con-${process.pid}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
async function cdp(){for(let i=0;i<60;i++){try{const r=await fetch(`http://127.0.0.1:${PORT}/json/version`);if(r.ok)return (await r.json()).webSocketDebuggerUrl;}catch{}await sleep(250);}throw new Error("no chrome");}
const ws=new WebSocket(await cdp());
await new Promise((res,rej)=>{ws.addEventListener("open",res,{once:true});ws.addEventListener("error",rej,{once:true});});
let id=0;const pending=new Map();const events=[];
ws.addEventListener("message",(ev)=>{const m=JSON.parse(ev.data);
  if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(new Error(JSON.stringify(m.error)));else p.resolve(m.result);}
  if(m.method==="Runtime.exceptionThrown")events.push("EXCEPTION: "+(m.params.exceptionDetails.exception?.message||m.params.exceptionDetails.text));
  if(m.method==="Runtime.consoleAPICalled"&&["error","warning"].includes(m.params.type))events.push("CONSOLE "+m.params.type+": "+m.params.args.map(a=>a.value??a.description??"").join(" "));
  if(m.method==="Log.entryAdded"&&m.params.entry.level==="error")events.push("LOG: "+m.params.entry.text);
});
const send=(m,p={},s)=>new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}));});
const {targetId}=await send("Target.createTarget",{url:"about:blank"});
const {sessionId}=await send("Target.attachToTarget",{targetId,flatten:true});
await send("Page.enable",{},sessionId);await send("Runtime.enable",{},sessionId);await send("Log.enable",{},sessionId);
const ROUTES=["/","/work","/work/ariv-agentic-revenue-recovery","/engineering","/proof","/lab","/about","/contact"];
for(const r of ROUTES){
  events.length=0;
  await send("Page.navigate",{url:`http://localhost:3000${r}`},sessionId);
  await sleep(2200);
  const st=await send("Runtime.evaluate",{expression:`({title:document.title, overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth, theme:document.documentElement.getAttribute('data-theme')})`,returnByValue:true},sessionId);
  const ev=await send("Runtime.evaluate",{expression:`JSON.stringify((performance.getEntriesByType('resource').filter(e=>e.responseStatus&&e.responseStatus>=400).map(e=>e.name)))`,returnByValue:true},sessionId);
  console.log(JSON.stringify({route:r, ...st.result.value, badRes:JSON.parse(ev.result.value), events}));
}
ws.close();chrome.kill();
try{spawn("taskkill",["/PID",String(chrome.pid),"/T","/F"],{stdio:"ignore"});}catch{}
