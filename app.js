const CONFIG = {
  worldBackgroundURI: "",
  defaultZoom: 0.72,
  minZoom: 0.25,
  maxZoom: 2.2,
  driftAmount: 18,
  driftSpeed: 0.035
};

// Each club stays in its own file. To add another club, copy a club file and
// add ONE import below. You never need to put all profile data in this file.
const modules = await Promise.all([
  import("./clubs/01_Hons_Family.js"),
  import("./clubs/02_Shadow_Family.js"),
  import("./clubs/03_Hollow_Circle.js"),
  import("./clubs/04_Neon_House.js"),
  import("./clubs/05_Velvet_Order.js"),
  import("./clubs/06_Night_Collective.js"),
  import("./clubs/07_Silver_Guild.js"),
  import("./clubs/08_Crimson_Family.js"),
  import("./clubs/09_Static_Society.js"),
  import("./clubs/10_Ghost_Network.js")
]);
const clubs = modules.map(m => m.default);
clubs.forEach((c,i)=>{ c.id=i+1; c.homeX=c.x||0; c.homeY=c.y||0; });

const $ = id => document.getElementById(id);
const canvas = $("mapCanvas");
const ctx = canvas.getContext("2d");
const stage = $("mapStage");
const warning = $("warning");
const app = $("app");
const input = $("familyInput");
const error = $("warningError");
const profilePanel = $("profilePanel");
let selected = null;
let view = {x:0,y:0,zoom:CONFIG.defaultZoom};
let dragging = false, moved = false, lastX=0, lastY=0;
let motionTime = 0, lastFrame = performance.now();

function fmt(n){
  n=Number(n)||0;
  if(n>=1e9)return (n/1e9).toFixed(1).replace(/\.0$/,'')+"B";
  if(n>=1e6)return (n/1e6).toFixed(1).replace(/\.0$/,'')+"M";
  if(n>=1e3)return (n/1e3).toFixed(1).replace(/\.0$/,'')+"K";
  return n.toLocaleString();
}
function escapeHTML(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function normalize(v){return String(v||"").trim().toLowerCase().replace(/\s+/g,"_");}
function distance(c){return Math.max(0,Math.round(Math.hypot(view.x-c.homeX,view.y-c.homeY)/8));}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800);}
function resize(){canvas.width=stage.clientWidth*devicePixelRatio;canvas.height=stage.clientHeight*devicePixelRatio;canvas.style.width=stage.clientWidth+"px";canvas.style.height=stage.clientHeight+"px";ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);}
window.addEventListener("resize",resize); resize();

$("clubCount").textContent=clubs.length.toLocaleString();
$("statClubs").textContent=clubs.length.toLocaleString();
$("statPeople").textContent=fmt(clubs.reduce((a,c)=>a+(Number(c.people)||0),0));
$("mapBackground").style.backgroundImage=CONFIG.worldBackgroundURI?`url("${CONFIG.worldBackgroundURI}")`:"";

function screen(c){
  const x=c._drawX??c.homeX, y=c._drawY??c.homeY;
  return {x:stage.clientWidth/2+(x-view.x)*view.zoom,y:stage.clientHeight/2+(y-view.y)*view.zoom};
}
function draw(){
  const W=stage.clientWidth,H=stage.clientHeight;
  ctx.clearRect(0,0,W,H);
  // Soft grid.
  ctx.save();ctx.globalAlpha=.17;ctx.strokeStyle="#167aa8";ctx.lineWidth=1;
  const gap=Math.max(45,110*view.zoom), ox=((W/2-view.x*view.zoom)%gap+gap)%gap, oy=((H/2-view.y*view.zoom)%gap+gap)%gap;
  for(let x=ox;x<W;x+=gap){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
  for(let y=oy;y<H;y+=gap){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
  ctx.restore();

  // Connections.
  ctx.save();ctx.lineWidth=1.1;ctx.globalAlpha=.55;
  for(let i=0;i<clubs.length;i++) for(let j=i+1;j<clubs.length;j++){
    const a=screen(clubs[i]),b=screen(clubs[j]);
    if((a.x-b.x)**2+(a.y-b.y)**2>900000)continue;
    const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);g.addColorStop(0,clubs[i].color||"#36cfff");g.addColorStop(1,clubs[j].color||"#36cfff");
    ctx.strokeStyle=g;ctx.globalAlpha=.25;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
  ctx.restore();

  clubs.forEach(c=>{
    const p=screen(c), r=Math.max(5,10*view.zoom), active=c===selected;
    if(p.x<-50||p.x>W+50||p.y<-50||p.y>H+50)return;
    ctx.save();
    ctx.shadowBlur=active?28:18;ctx.shadowColor=c.color||"#25c8ff";ctx.fillStyle=active?"#fff":(c.color||"#25c8ff");
    ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;ctx.strokeStyle="#b9f3ff";ctx.globalAlpha=.55;ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,r+5,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="#d9f8ff";ctx.globalAlpha=.9;ctx.font="700 9px system-ui";ctx.fillText(c.name,p.x+r+7,p.y+3);
    ctx.fillStyle="#6f9caf";ctx.font="8px system-ui";ctx.fillText(`${fmt(c.people)} · ${fmt(c.active)} ACT`,p.x+r+7,p.y+14);
    ctx.restore();
  });
  $("coords").textContent=`X ${Math.round(view.x).toString().padStart(4,"0")} · Y ${Math.round(view.y).toString().padStart(4,"0")}`;
  if(selected) $("vectorDistance").textContent=distance(selected)+" KM";
}

function animate(now){
  const dt=Math.min(.05,(now-lastFrame)/1000);lastFrame=now;motionTime+=dt;
  clubs.forEach((c,i)=>{c._drawX=c.homeX+Math.sin(motionTime*(CONFIG.driftSpeed+i*.001)+i)*CONFIG.driftAmount;c._drawY=c.homeY+Math.cos(motionTime*(CONFIG.driftSpeed*.82+i*.0008)+i*1.7)*CONFIG.driftAmount*.72});
  draw();requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function focusClub(c){
  selected=c;
  const from={x:view.x,y:view.y}, to={x:c.homeX,y:c.homeY};
  const start=performance.now(), duration=700;
  function step(now){const t=Math.min(1,(now-start)/duration),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;view.x=from.x+(to.x-from.x)*e;view.y=from.y+(to.y-from.y)*e;if(t<1)requestAnimationFrame(step);}
  requestAnimationFrame(step);
  renderProfile(c); updatePreview(); toast(`LOCKED // ${c.name}`);
}

function wikiEntries(wiki){
  if(Array.isArray(wiki)) return wiki.filter(Boolean);
  return String(wiki||"").split(/\n+/).map(s=>s.trim()).filter(Boolean);
}
function renderProfile(c){
  const hero=c.backgroundURI?`url("${c.backgroundURI}")`:"linear-gradient(135deg,#06385a,#020916)";
  const entries=wikiEntries(c.wiki);
  $("profileContent").innerHTML=`
    <div class="profile-hero" style="background-image:${hero}"><div class="profile-head"><div class="profile-tag">CLUB // ${String(c.id).padStart(2,"0")}</div><div class="profile-name">${escapeHTML(c.name)}</div></div></div>
    <div class="profile-body">
      <div class="profile-stats"><div class="pstat"><b>${fmt(c.people)}</b><span>PEOPLE</span></div><div class="pstat"><b>${fmt(c.active)}</b><span>ACTIVE NOW</span></div></div>
      <div class="wiki-title">HOVER // PREVIEW</div><div class="wiki">()< ${escapeHTML(c.hoverText)} >()</div>
      <div class="wiki-title">WIKI // PROFILE</div>
      <div class="wiki wiki-list">${entries.map(x=>`<div class="wiki-entry">()< ${escapeHTML(x)} >()</div>`).join("")}</div>
      <div class="wiki-title">CONNECTED TRAITS</div><div class="connections">${(c.tags||[]).map(t=>`<span class="chip">${escapeHTML(t)}</span>`).join("")}</div>
      <div class="wiki-title">VECTOR</div><div class="wiki">Approx. <b>${distance(c)} KM</b> from your current world vector.</div>
    </div>`;
  profilePanel.classList.remove("closed");
}
function updatePreview(){
  $("clubPreview").innerHTML=clubs.map(c=>`<div class="preview" data-id="${c.id}" title="${escapeHTML(c.name)}">${c.backgroundURI?`<img src="${escapeHTML(c.backgroundURI)}" onerror="this.style.display='none'">`:""}<span>${escapeHTML(c.name)}</span></div>`).join("");
  $("clubPreview").querySelectorAll(".preview").forEach(el=>el.onclick=()=>focusClub(clubs[Number(el.dataset.id)-1]));
}
updatePreview();

function findClub(q){
  const n=normalize(q);return clubs.find(c=>normalize(c.name)===n)||clubs.find(c=>normalize(c.name).includes(n));
}
function enterWorld(){
  const q=input.value.trim();
  const c=findClub(q);
  if(!c){error.textContent=`FAMILY NOT FOUND // Try one of the available club names.`;input.focus();return;}
  error.textContent="";warning.classList.add("hidden");app.classList.remove("hidden");
  setTimeout(()=>focusClub(c),40);
}
$("enterBtn").onclick=enterWorld;
input.addEventListener("keydown",e=>{if(e.key==="Enter")enterWorld()});

stage.addEventListener("pointerdown",e=>{if(e.button!==0)return;dragging=true;moved=false;lastX=e.clientX;lastY=e.clientY;stage.classList.add("dragging");stage.setPointerCapture(e.pointerId)});
stage.addEventListener("pointermove",e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;view.x-=dx/view.zoom;view.y-=dy/view.zoom;lastX=e.clientX;lastY=e.clientY});
stage.addEventListener("pointerup",e=>{dragging=false;stage.classList.remove("dragging");stage.releasePointerCapture?.(e.pointerId)});
stage.addEventListener("pointercancel",()=>{dragging=false;stage.classList.remove("dragging")});

stage.addEventListener("wheel",e=>{e.preventDefault();const old=view.zoom;const factor=e.deltaY<0?1.1:.9;const next=Math.max(CONFIG.minZoom,Math.min(CONFIG.maxZoom,old*factor));const rect=stage.getBoundingClientRect();const mx=e.clientX-rect.left,my=e.clientY-rect.top;const wx=view.x+(mx-rect.width/2)/old,wy=view.y+(my-rect.height/2)/old;view.zoom=next;view.x=wx-(mx-rect.width/2)/next;view.y=wy-(my-rect.height/2)/next},{passive:false});

stage.addEventListener("click",e=>{
  if(moved)return;
  const rect=canvas.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top;
  let hit=null,best=Infinity;
  clubs.forEach(c=>{const p=screen(c),d=Math.hypot(mx-p.x,my-p.y);if(d<Math.max(18,18*view.zoom)&&d<best){best=d;hit=c}});
  if(hit)focusClub(hit);
});

stage.addEventListener("mousemove",e=>{
  if(dragging)return;
  const rect=canvas.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top;
  let hit=null,best=Infinity;clubs.forEach(c=>{const p=screen(c),d=Math.hypot(mx-p.x,my-p.y);if(d<Math.max(20,20*view.zoom)&&d<best){best=d;hit=c}});
  const card=$("hoverCard");
  if(!hit){card.classList.remove("show");return;}
  card.innerHTML=`<b>${escapeHTML(hit.name)}</b><span>${escapeHTML(hit.hoverText||"")}</span><small>${fmt(hit.people)} PEOPLE · ${fmt(hit.active)} ACTIVE</small>`;
  card.style.left=Math.min(stage.clientWidth-270,Math.max(12,e.clientX-rect.left+16))+"px";
  card.style.top=Math.min(stage.clientHeight-110,Math.max(12,e.clientY-rect.top+16))+"px";
  card.classList.add("show");
});

$("closePanel").onclick=()=>profilePanel.classList.add("closed");
$("resetBtn").onclick=()=>{view.x=selected?.homeX||0;view.y=selected?.homeY||0;view.zoom=CONFIG.defaultZoom};
$("zoomIn").onclick=()=>view.zoom=Math.min(CONFIG.maxZoom,view.zoom*1.18);
$("zoomOut").onclick=()=>view.zoom=Math.max(CONFIG.minZoom,view.zoom/1.18);
$("zoomReset").onclick=()=>view.zoom=CONFIG.defaultZoom;
$("searchInput").addEventListener("input",e=>{const c=findClub(e.target.value);if(c&&e.target.value.trim())focusClub(c)});
$("applyUris").onclick=()=>{CONFIG.worldBackgroundURI=$("worldBgInput").value.trim();$("mapBackground").style.backgroundImage=CONFIG.worldBackgroundURI?`url("${CONFIG.worldBackgroundURI}")`:"";if(selected){selected.backgroundURI=$("clubBgInput").value.trim();renderProfile(selected);updatePreview()}toast("URI SETTINGS APPLIED")};
