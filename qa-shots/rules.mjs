import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 31000 + Math.floor(Math.random() * 8000);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/rules-${process.pid}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
async function cdp(){for(let i=0;i<60;i++){try{const r=await fetch(`http://127.0.0.1:${PORT}/json/version`);if(r.ok)return (await r.json()).webSocketDebuggerUrl;}catch{}await sleep(250);}throw new Error("no chrome");}
const ws=new WebSocket(await cdp());
await new Promise((res,rej)=>{ws.addEventListener("open",res,{once:true});ws.addEventListener("error",rej,{once:true});});
let id=0;const pending=new Map();
ws.addEventListener("message",(ev)=>{const m=JSON.parse(ev.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(new Error(JSON.stringify(m.error)));else p.resolve(m.result);}});
const send=(m,p={},s)=>new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}));});
const {targetId}=await send("Target.createTarget",{url:"about:blank"});
const {sessionId}=await send("Target.attachToTarget",{targetId,flatten:true});
await send("Page.enable",{},sessionId);await send("Runtime.enable",{},sessionId);await send("DOM.enable",{},sessionId);await send("CSS.enable",{},sessionId);
const W=Number(process.argv[2]||1440),H=Number(process.argv[3]||900);
await send("Emulation.setDeviceMetricsOverride",{width:W,height:H,deviceScaleFactor:1,mobile:false,screenWidth:W,screenHeight:H},sessionId);
await send("Page.navigate",{url:"http://localhost:3000/"},sessionId);
await sleep(2600);
const out=await send("Runtime.evaluate",{expression:`JSON.stringify((()=>{
  const hits=[];
  const walk=(rules,media)=>{
    for(const r of rules){
      if(!r.selectorText){
        if(r.cssRules){walk(r.cssRules,(media||"")+" "+(r.conditionText||r.media?.mediaText||""));}
        continue;
      }
      if(/(^|[^\\w-])\\.desk([^\\w-]|$)/.test(r.selectorText)) hits.push({sel:r.selectorText,media:(media||"").trim(),css:r.style.cssText});
    }
  };
  for(const ss of document.styleSheets){try{walk(ss.cssRules,"");}catch(e){hits.push({sel:"ERR",media:"",css:String(e)});}}
  const d=document.querySelector('.desk');
  const cs=getComputedStyle(d);
  const inline=Object.fromEntries([...d.attributes].map(a=>[a.name,a.value]));
  return {hits, computed:{cols:cs.gridTemplateColumns,gap:cs.gap,display:cs.display}, parent:d.parentElement.className, parentW:Math.round(d.getBoundingClientRect().width), attrs:inline};
})())`,returnByValue:true},sessionId);
console.log(out.result.value);
const doc=await send("DOM.getDocument",{},sessionId);
const {nodeId}=await send("DOM.querySelector",{nodeId:doc.root.nodeId,selector:".desk"},sessionId);
const matched=await send("CSS.getMatchedStylesForNode",{nodeId},sessionId);
const rules=(matched.matchedCSSRules||[]).map(e=>({sel:e.rule.selectorList.text,media:(e.rule.media||[]).map(m=>m.text).join(" "),origin:e.rule.origin,props:Object.fromEntries((e.rule.style.cssProperties||[]).filter(p=>/grid-template-columns|^gap$/.test(p.name)).map(p=>[p.name,p.value])),inline:e.inlineStyle?Object.fromEntries((e.inlineStyle.cssProperties||[]).filter(p=>/grid-template-columns|^gap$/.test(p.name)).map(p=>[p.name,p.value])):null})).filter(r=>r.props["grid-template-columns"]||r.props.gap||r.inline);
console.log(JSON.stringify(rules,null,1));
ws.close();chrome.kill();
try{spawn("taskkill",["/PID",String(chrome.pid),"/T","/F"],{stdio:"ignore"});}catch{}
