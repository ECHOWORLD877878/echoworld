import club01 from "./clubs/01_Hons_Family.js";
import club02 from "./clubs/02_Shadow_Family.js";
import club03 from "./clubs/03_Hollow_Circle.js";


const CONFIG = {
  worldBackgroundURI: "https://i.pinimg.com/originals/8c/03/6e/8c036e8f2bda8cef96625e0775af3214.gif", // Put your main map background image URL here.
  titleBadge: "LIVE",
  Familys_near_us: 5
};

const clubs = [club01,club02,club03,club04,club05,club06,club07,club08,club09,club10];
clubs.forEach((club,index)=>club.id=index+1);

const canvas=document.getElementById("mapCanvas"),ctx=canvas.getContext("2d");
let W=innerWidth,H=innerHeight,dpr=devicePixelRatio||1;
let view={x:0,y:0,zoom:.58}, dragging=false, sx=0,sy=0,ox=0,oy=0, hovered=null, selected=null;
const stage=document.getElementById("mapStage"), hoverCard=document.getElementById("hoverCard");

function resize(){W=innerWidth;H=innerHeight;dpr=devicePixelRatio||1;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener("resize",resize); resize();

function screen(c){const x=c._drawX??c.x,y=c._drawY??c.y;return {x:W/2+(x-view.x)*view.zoom,y:H/2+(y-view.y)*view.zoom}}
function worldAt(px,py){return {x:view.x+(px-W/2)/view.zoom,y:view.y+(py-H/2)/view.zoom}}
function distance(c){return Math.max(1,Math.round(Math.hypot(c.x-view.x,c.y-view.y)/100))}
function focus(c,animate=true){
  const from={x:view.x,y:view.y},to={x:c.x,y:c.y},start=performance.now();
  const dur=animate?650:0;
  function step(t){const p=dur?Math.min(1,(t-start)/dur):1,e=p<1?1-Math.pow(1-p,3):1;view.x=from.x+(to.x-from.x)*e;view.y=from.y+(to.y-from.y)*e;if(p<1)requestAnimationFrame(step)}
  requestAnimationFrame(step);
  selected=c; openProfile(c);
}
let motionTime=0,lastFrame=performance.now();
function animateClubs(now){
  const dt=Math.min(.035,(now-lastFrame)/1000); lastFrame=now; motionTime+=dt;
  clubs.forEach((c,i)=>{c._drawX=c.x+Math.sin(motionTime*(.10+i*.003)+i)*18;c._drawY=c.y+Math.cos(motionTime*(.085+i*.002)+i*1.7)*13});
  requestAnimationFrame(animateClubs);
}
requestAnimationFrame(animateClubs);

function draw(){
  ctx.clearRect(0,0,W,H);
  const visible=clubs.filter(c=>{const s=screen(c);return s.x>-80&&s.x<W+80&&s.y>-80&&s.y<H+80});
  // Network links: deterministic nearby graph.
  ctx.lineWidth=1;
  for(const c of visible){
    const s=screen(c);
    for(let k=1;k<=2;k++){
      const other=clubs[(c.id+k*37)%clubs.length], o=screen(other);
      if(o.x<-100||o.x>W+100||o.y<-100||o.y>H+100)continue;
      ctx.strokeStyle="rgba(35,178,255,.12)";
      ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(o.x,o.y);ctx.stroke();
    }
  }
  for(const c of visible){
    const s=screen(c),r=Math.max(2.5,5*view.zoom);
    const active=c===selected||c===hovered;
    ctx.beginPath();ctx.arc(s.x,s.y,r*3,0,Math.PI*2);ctx.fillStyle=active?"rgba(0,190,255,.13)":"rgba(0,160,255,.05)";ctx.fill();
    ctx.beginPath();ctx.arc(s.x,s.y,r,0,Math.PI*2);ctx.fillStyle=active?"#ffffff":(c.color||"#24baff");ctx.fill();
    ctx.strokeStyle=active?"#fff":(c.color||"#5de1ff");ctx.lineWidth=active?1.5:1;ctx.stroke();
    if(view.zoom>.72 || active){
      ctx.font=`${Math.max(8,10*view.zoom)}px Inter, sans-serif`;ctx.fillStyle=active?"#fff":"rgba(170,225,244,.62)";
      ctx.fillText(c.name,s.x+9,s.y-7);
      ctx.font=`${Math.max(7,8*view.zoom)}px Inter, sans-serif`;ctx.fillStyle="rgba(95,173,202,.72)";
      ctx.fillText(`${fmt(c.people)} · ${fmt(c.active)} act.`,s.x+9,s.y+6);
    }
  }
  requestAnimationFrame(draw);
}
draw();

function nearest(px,py){
  let best=null,bd=Infinity;
  for(const c of clubs){const s=screen(c),d=Math.hypot(px-s.x,py-s.y);if(d<Math.max(16,13*view.zoom)&&d<bd){best=c;bd=d}}
  return best;
}
function updateHover(c,px,py){
  hovered=c;
  if(!c){hoverCard.classList.remove("show");return}
  hoverCard.innerHTML=`<div class="hover-name">${c.name}</div><div class="hover-meta">${fmt(c.people)} PEOPLE · ${fmt(c.active)} ACTIVE</div><div class="hover-meta">${distance(c)} KM FROM VECTOR</div>`;
  hoverCard.style.left=Math.min(px,W-200)+"px";hoverCard.style.top=Math.min(py,H-100)+"px";hoverCard.classList.add("show");
}
stage.addEventListener("pointerdown",e=>{if(e.target.closest(".bottom-dock,.profile-panel,.topbar,.hud,.zoom-control,.uri-bar"))return;dragging=true;sx=e.clientX;sy=e.clientY;ox=view.x;oy=view.y;stage.classList.add("dragging");stage.setPointerCapture(e.pointerId)});
stage.addEventListener("pointermove",e=>{
  if(dragging){view.x=ox-(e.clientX-sx)/view.zoom;view.y=oy-(e.clientY-sy)/view.zoom}
  const c=nearest(e.clientX,e.clientY);updateHover(c,e.clientX,e.clientY);
  document.getElementById("coords").textContent=`X ${Math.round(view.x).toString().padStart(4,"0")} · Y ${Math.round(view.y).toString().padStart(4,"0")}`;
  if(selected)document.getElementById("vectorDistance").textContent=distance(selected)+" KM";
});
stage.addEventListener("pointerup",e=>{dragging=false;stage.classList.remove("dragging")});
stage.addEventListener("dblclick",e=>{const c=nearest(e.clientX,e.clientY);if(c)focus(c)});
stage.addEventListener("wheel",e=>{e.preventDefault();const before=worldAt(e.clientX,e.clientY),factor=e.deltaY<0?1.12:.89;view.zoom=Math.max(.25,Math.min(2.5,view.zoom*factor));const after=worldAt(e.clientX,e.clientY);view.x+=before.x-after.x;view.y+=before.y-after.y},{passive:false});

function openProfile(c){selected=c;document.getElementById("profilePanel").classList.remove("closed");renderProfile(c)}
function esc(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function renderProfile(c){
 const hero=c.backgroundURI||"";
 document.getElementById("profileContent").innerHTML=`<div class="profile-hero" style="background-image:${hero?`url("${hero}")`:"linear-gradient(135deg,#06385a,#020916)"}"><div class="profile-head"><div class="profile-tag">CLUB // ${String(c.id).padStart(2,"0")}</div><div class="profile-name">${esc(c.name)}</div></div></div><div class="profile-body"><div class="profile-stats"><div class="pstat"><b>${fmt(c.people)}</b><span>PEOPLE</span></div><div class="pstat"><b>${fmt(c.active)}</b><span>ACTIVE NOW</span></div></div><div class="wiki-title">WIKI // PROFILE</div><div class="wiki">${esc(c.wiki)}</div><div class="wiki-title">HOVER // PREVIEW</div><div class="wiki">${esc(c.hoverText)}</div><div class="wiki-title">CONNECTED TRAITS</div><div class="connections">${c.tags.map(t=>`<span class="chip">${esc(t)}</span>`).join("")}</div><div class="editor"><div class="editor-title">EDIT THIS CLUB</div><label>Name<input id="editName" value="${esc(c.name)}"></label><label>People<input id="editPeople" type="number" value="${c.people}"></label><label>Active<input id="editActive" type="number" value="${c.active}"></label><label>Hover text<textarea id="editHover">${esc(c.hoverText)}</textarea></label><label>Wiki<textarea id="editWiki">${esc(c.wiki)}</textarea></label><label>Dot / line color<input id="editColor" value="${esc(c.color)}"></label><label>Background URI<input id="editBackground" value="${esc(c.backgroundURI)}"></label><button id="saveClub">SAVE PROFILE</button></div><div class="wiki-title">VECTOR</div><div class="wiki">Approx. <b>${distance(c)} KM</b> from the current world vector.</div></div>`;
 document.getElementById("vectorDistance").textContent=distance(c)+" KM";
 document.getElementById("saveClub").onclick=()=>{c.name=document.getElementById("editName").value.trim()||c.name;c.people=Math.max(0,Number(document.getElementById("editPeople").value)||0);c.active=Math.max(0,Number(document.getElementById("editActive").value)||0);c.hoverText=document.getElementById("editHover").value;c.wiki=document.getElementById("editWiki").value;c.color=document.getElementById("editColor").value.trim()||"#25c8ff";c.backgroundURI=document.getElementById("editBackground").value.trim();renderProfile(c);toast(c.name+" profile saved")};
}
document.getElementById("closePanel").onclick=()=>document.getElementById("profilePanel").classList.add("closed");
document.getElementById("resetBtn").onclick=()=>{view={x:0,y:0,zoom:.58};toast("World vector recentered")};
document.getElementById("zoomIn").onclick=()=>view.zoom=Math.min(2.5,view.zoom*1.18);
document.getElementById("zoomOut").onclick=()=>view.zoom=Math.max(.25,view.zoom*.85);
document.getElementById("zoomReset").onclick=()=>view.zoom=.58;

const previews=document.getElementById("clubPreview");
clubs.forEach(c=>{const el=document.createElement("div");el.className="preview";el.innerHTML=`<img src="${c.backgroundURI}" alt=""><span>${c.name}</span>`;el.onclick=()=>focus(c);previews.appendChild(el)});

document.getElementById("searchInput").addEventListener("input",e=>{
  const q=e.target.value.trim().toLowerCase();if(!q)return;
  const c=clubs.find(x=>x.name.toLowerCase().includes(q));if(c)focus(c,false);
});

function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),1800)}
document.getElementById("applyUris").onclick=()=>{
  const w=document.getElementById("worldBgInput").value.trim(),c=document.getElementById("clubBgInput").value.trim();
  if(w){document.getElementById("mapBackground").style.backgroundImage=`url("${w}")`;CONFIG.worldBackgroundURI=w}
  if(c&&selected){selected.backgroundURI=c;openProfile(selected)}
  toast("URI settings applied");
};
if(CONFIG.worldBackgroundURI)document.getElementById("mapBackground").style.backgroundImage=`url("${CONFIG.worldBackgroundURI}")`;

function enterWorld(){
  const value=document.getElementById("familyInput").value.trim();
  if(!value){document.getElementById("warningError").textContent="Enter a family name to continue.";return}
  document.getElementById("warning").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  const family=clubs.find(c=>c.name.toLowerCase()===value.toLowerCase())||clubs.find(c=>c.name==="Hon's_Family");
  if(value==="Hon's_Family")focus(family);
  else toast(`Searching network for ${value}…`);
}
document.getElementById("enterBtn").onclick=enterWorld;
document.getElementById("familyInput").addEventListener("keydown",e=>{if(e.key==="Enter")enterWorld()});
document.getElementById("clubCount").textContent=CONFIG.clubCount.toLocaleString();
document.getElementById("statClubs").textContent=CONFIG.clubCount.toLocaleString();
document.getElementById("statPeople").textContent=fmt(clubs.reduce((a,c)=>a+c.people,0));
document.getElementById("titleBadge").textContent=CONFIG.titleBadge;
