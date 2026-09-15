const CONFIG = {
  worldBackgroundURI: "", // Put your main map background image URL here.
  titleBadge: "LIVE",
  clubCount: 3000,
  // Add real clubs here. These override generated demo clubs when names match.
  customClubs: {
    "Hon's_Family": {
      people: 670000, active: 100000,
      backgroundURI: "",
      wiki: "Hon's_Family is the largest known club in ECHO//WORLD. Its network is centered in the eastern district and is treated as a major anchor of the world map.",
      tags: ["Largest Network","Eastern District","Anchor"]
    }
  }
};

const namesA = ["Astra","Hollow","Neon","Velvet","Night","Echo","Silver","Crimson","North","Blue","Static","Ghost","Nova","Iron","Moon","Zero","Golden","Obsidian","Wild","Frost","Solar","Rift","Storm","Vanta","Dusk"];
const namesB = ["Union","Circle","Order","Family","Collective","House","Syndicate","Guild","Crew","Society","Network","District"];
const cityA = ["West","East","Central","North","South","Old","New","Lower","Upper","Mid"];
const cityB = ["Station","Arc","Sector","Cross","Heights","Point","Ward","Vale","Junction","Gate"];

function hash(i){ let x=Math.sin(i*999.91)*43758.5453; return x-Math.floor(x); }
function randomFrom(arr,i,off=0){return arr[Math.floor(hash(i+off)*arr.length)]}
function fmt(n){return n>=1e6?(n/1e6).toFixed(1).replace(".0","")+"M":n>=1e3?Math.round(n/1e3)+"K":String(n)}
function makeImage(i){
  // Every demo club has its own image URI. Replace this with your real image URLs.
  return `https://images.unsplash.com/photo-${["1519608487953-e999c86e7455","1519681393784-d120267933ba","1493246507139-91e8fad9978e","1470770841072-f978cf4d019e","1511497584788-876760111969"][i%5]}?auto=format&fit=crop&w=1000&q=80&sig=${i}`;
}
const clubs=[];
for(let i=0;i<CONFIG.clubCount;i++){
  let name = `${randomFrom(namesA,i)} ${randomFrom(namesB,i,22)}`;
  if(i===0) name="Hon's_Family";
  const people = i===0 ? 670000 : Math.floor(500 + hash(i*4)*180000);
  const active = i===0 ? 100000 : Math.max(20,Math.floor(people*(.05+hash(i*8)*.23)));
  clubs.push({
    id:i,name,people,active,
    x:(hash(i*13)-.5)*3600,y:(hash(i*19)-.5)*2200,
    city:`${randomFrom(cityA,i,70)} ${randomFrom(cityB,i,90)}`,
    backgroundURI:makeImage(i),
    wiki:`${name} is a connected club operating around ${randomFrom(cityA,i,101)} ${randomFrom(cityB,i,115)}. Its members are linked through the ECHO//WORLD network, with activity changing as the world moves.`,
    tags:[randomFrom(["Independent","Verified","Rising","Legacy","Regional"],i,140),randomFrom(["Trade","Music","Gaming","Art","Events","Social"],i,155),randomFrom(["Blue Line","North Link","Core","Outer Ring"],i,170)]
  });
}
Object.entries(CONFIG.customClubs).forEach(([name,data])=>{
  const c=clubs.find(x=>x.name===name);
  if(c) Object.assign(c,data,{name});
});

const canvas=document.getElementById("mapCanvas"),ctx=canvas.getContext("2d");
let W=innerWidth,H=innerHeight,dpr=devicePixelRatio||1;
let view={x:0,y:0,zoom:.58}, dragging=false, sx=0,sy=0,ox=0,oy=0, hovered=null, selected=null;
const stage=document.getElementById("mapStage"), hoverCard=document.getElementById("hoverCard");

function resize(){W=innerWidth;H=innerHeight;dpr=devicePixelRatio||1;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener("resize",resize); resize();

function screen(c){return {x:W/2+(c.x-view.x)*view.zoom,y:H/2+(c.y-view.y)*view.zoom}}
function worldAt(px,py){return {x:view.x+(px-W/2)/view.zoom,y:view.y+(py-H/2)/view.zoom}}
function distance(c){return Math.max(1,Math.round(Math.hypot(c.x-view.x,c.y-view.y)/100))}
function focus(c,animate=true){
  const from={x:view.x,y:view.y},to={x:c.x,y:c.y},start=performance.now();
  const dur=animate?650:0;
  function step(t){const p=dur?Math.min(1,(t-start)/dur):1,e=p<1?1-Math.pow(1-p,3):1;view.x=from.x+(to.x-from.x)*e;view.y=from.y+(to.y-from.y)*e;if(p<1)requestAnimationFrame(step)}
  requestAnimationFrame(step);
  selected=c; openProfile(c);
}
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
    ctx.beginPath();ctx.arc(s.x,s.y,r,0,Math.PI*2);ctx.fillStyle=active?"#8ff0ff":"#24baff";ctx.fill();
    ctx.strokeStyle=active?"#fff":"rgba(93,225,255,.65)";ctx.lineWidth=active?1.5:1;ctx.stroke();
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

function openProfile(c){
  selected=c;document.getElementById("profilePanel").classList.remove("closed");
  const hero=c.backgroundURI||"";
  document.getElementById("profileContent").innerHTML=`
    <div class="profile-hero" style="background-image:${hero?`url("${hero}")`:"linear-gradient(135deg,#06385a,#020916)"}">
      <div class="profile-head"><div class="profile-tag">CLUB // ${String(c.id+1).padStart(4,"0")}</div><div class="profile-name">${c.name}</div></div>
    </div>
    <div class="profile-body">
      <div class="profile-stats"><div class="pstat"><b>${fmt(c.people)}</b><span>PEOPLE</span></div><div class="pstat"><b>${fmt(c.active)}</b><span>ACTIVE NOW</span></div></div>
      <div class="wiki-title">WIKI // PROFILE</div><div class="wiki">${c.wiki}</div>
      <div class="wiki-title">CONNECTED TRAITS</div><div class="connections">${c.tags.map(t=>`<span class="chip">${t}</span>`).join("")}</div>
      <div class="wiki-title">VECTOR</div><div class="wiki">Approx. <b>${distance(c)} KM</b> from the current world vector. Drag the map and the distance will update in real time.</div>
    </div>`;
  document.getElementById("vectorDistance").textContent=distance(c)+" KM";
}
document.getElementById("closePanel").onclick=()=>document.getElementById("profilePanel").classList.add("closed");
document.getElementById("resetBtn").onclick=()=>{view={x:0,y:0,zoom:.58};toast("World vector recentered")};
document.getElementById("zoomIn").onclick=()=>view.zoom=Math.min(2.5,view.zoom*1.18);
document.getElementById("zoomOut").onclick=()=>view.zoom=Math.max(.25,view.zoom*.85);
document.getElementById("zoomReset").onclick=()=>view.zoom=.58;

const previews=document.getElementById("clubPreview");
clubs.slice(0,12).forEach(c=>{const el=document.createElement("div");el.className="preview";el.innerHTML=`<img src="${c.backgroundURI}" alt=""><span>${c.name}</span>`;el.onclick=()=>focus(c);previews.appendChild(el)});

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
