import hon from './clubs/01_Hons_Family.js';
import shadow from './clubs/02_Shadow_Family.js';
import hollow from './clubs/03_Hollow_Circle.js';
import neon from './clubs/04_Neon_House.js';
import velvet from './clubs/05_Velvet_Order.js';
import night from './clubs/06_Night_Collective.js';
import silver from './clubs/07_Silver_Guild.js';
import crimson from './clubs/08_Crimson_Family.js';
import staticSociety from './clubs/09_Static_Society.js';
import ghost from './clubs/10_Ghost_Network.js';

const clubs=[hon,shadow,hollow,neon,velvet,night,silver,crimson,staticSociety,ghost];
const CONFIG={worldBackgroundURI:'',titleBadge:'LIVE',clubCount:clubs.length};
const canvas=document.getElementById('mapCanvas'),ctx=canvas.getContext('2d');
const stage=document.getElementById('mapStage'),hoverCard=document.getElementById('hoverCard');
let W=innerWidth,H=innerHeight,dpr=devicePixelRatio||1;
let view={x:0,y:0,zoom:.58},dragging=false,moved=false,sx=0,sy=0,ox=0,oy=0,hovered=null,selected=null;

function resize(){W=innerWidth;H=innerHeight;dpr=devicePixelRatio||1;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize);resize();
function fmt(n){return n>=1e6?(n/1e6).toFixed(1).replace('.0','')+'M':n>=1e3?Math.round(n/1e3)+'K':String(n)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function screen(c){return{x:W/2+((c._drawX??c.x)-view.x)*view.zoom,y:H/2+((c._drawY??c.y)-view.y)*view.zoom}}
function distance(c){return Math.max(1,Math.round(Math.hypot(c.x-view.x,c.y-view.y)/100))}

let motionTime=0,lastFrame=performance.now();
function animateClubs(now){const dt=Math.min(.035,(now-lastFrame)/1000);lastFrame=now;motionTime+=dt;clubs.forEach((c,i)=>{c._drawX=c.x+Math.sin(motionTime*(.10+i*.003)+i)*18;c._drawY=c.y+Math.cos(motionTime*(.085+i*.002)+i*1.7)*13});requestAnimationFrame(animateClubs)}
requestAnimationFrame(animateClubs);

function draw(){
 ctx.clearRect(0,0,W,H);
 for(let i=0;i<clubs.length;i++)for(let j=i+1;j<clubs.length;j++){
  const a=screen(clubs[i]),b=screen(clubs[j]);
  if((a.x<-100&&b.x<-100)||(a.x>W+100&&b.x>W+100)||(a.y<-100&&b.y<-100)||(a.y>H+100&&b.y>H+100))continue;
  ctx.strokeStyle='rgba(35,178,255,.16)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
 }
 clubs.forEach(c=>{const s=screen(c),active=c===selected||c===hovered,r=Math.max(4,6*view.zoom);
  ctx.beginPath();ctx.arc(s.x,s.y,r*3.5,0,Math.PI*2);ctx.fillStyle=active?'rgba(0,210,255,.22)':'rgba(0,160,255,.08)';ctx.fill();
  ctx.beginPath();ctx.arc(s.x,s.y,r,0,Math.PI*2);ctx.fillStyle=active?'#fff':(c.color||'#25c8ff');ctx.fill();ctx.strokeStyle=active?'#fff':(c.color||'#25c8ff');ctx.lineWidth=active?2:1;ctx.stroke();
  ctx.font=`${Math.max(9,11*view.zoom)}px Inter,Arial,sans-serif`;ctx.fillStyle=active?'#fff':'rgba(180,230,245,.82)';ctx.fillText(c.name,s.x+12,s.y-8);
  ctx.font=`${Math.max(8,9*view.zoom)}px Inter,Arial,sans-serif`;ctx.fillStyle='rgba(100,190,220,.72)';ctx.fillText(`${fmt(c.people)} · ${fmt(c.active)} act.`,s.x+12,s.y+7);
 });
 requestAnimationFrame(draw);
}
draw();

function nearest(px,py){let best=null,bd=Infinity;for(const c of clubs){const s=screen(c),d=Math.hypot(px-s.x,py-s.y);if(d<Math.max(18,15*view.zoom)&&d<bd){best=c;bd=d}}return best}
function updateHover(c,px,py){hovered=c;if(!c){hoverCard.classList.remove('show');return}hoverCard.innerHTML=`<div class="hover-name">${esc(c.name)}</div><div class="hover-meta">${fmt(c.people)} PEOPLE · ${fmt(c.active)} ACTIVE</div><div class="hover-meta">${distance(c)} KM FROM VECTOR</div><div class="hover-description">${esc(c.hoverText)}</div>`;hoverCard.style.left=Math.min(px,W-230)+'px';hoverCard.style.top=Math.min(py,H-150)+'px';hoverCard.classList.add('show')}
function focus(c,animate=true){const from={x:view.x,y:view.y},to={x:c.x,y:c.y},start=performance.now(),dur=animate?650:0;function step(t){const p=dur?Math.min(1,(t-start)/dur):1,e=p<1?1-Math.pow(1-p,3):1;view.x=from.x+(to.x-from.x)*e;view.y=from.y+(to.y-from.y)*e;if(p<1)requestAnimationFrame(step)}requestAnimationFrame(step);selected=c;openProfile(c)}

stage.addEventListener('pointerdown',e=>{if(e.target.closest('.bottom-dock,.profile-panel,.topbar,.hud,.zoom-control,.uri-bar'))return;dragging=true;moved=false;sx=e.clientX;sy=e.clientY;ox=view.x;oy=view.y;stage.classList.add('dragging');stage.setPointerCapture(e.pointerId)});
stage.addEventListener('pointermove',e=>{if(dragging){if(Math.hypot(e.clientX-sx,e.clientY-sy)>5)moved=true;view.x=ox-(e.clientX-sx)/view.zoom;view.y=oy-(e.clientY-sy)/view.zoom}const c=nearest(e.clientX,e.clientY);updateHover(c,e.clientX,e.clientY);document.getElementById('coords').textContent=`X ${Math.round(view.x)} · Y ${Math.round(view.y)}`;if(selected)document.getElementById('vectorDistance').textContent=distance(selected)+' KM'});
stage.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;stage.classList.remove('dragging');if(!moved){const c=nearest(e.clientX,e.clientY);if(c)focus(c)}});
stage.addEventListener('wheel',e=>{e.preventDefault();const before={x:view.x+(e.clientX-W/2)/view.zoom,y:view.y+(e.clientY-H/2)/view.zoom};view.zoom=Math.max(.25,Math.min(2.5,view.zoom*(e.deltaY<0?1.12:.89)));const after={x:view.x+(e.clientX-W/2)/view.zoom,y:view.y+(e.clientY-H/2)/view.zoom};view.x+=before.x-after.x;view.y+=before.y-after.y},{passive:false});

function openProfile(c){selected=c;document.getElementById('profilePanel').classList.remove('closed');renderProfile(c)}
function wikiHtml(w){const arr=Array.isArray(w)?w:[w];return arr.filter(Boolean).map(x=>`<div class="wiki-line">()< ${esc(x)} >()</div>`).join('')}
function renderProfile(c){const hero=c.backgroundURI||'';document.getElementById('profileContent').innerHTML=`<div class="profile-hero" style="background-image:${hero?`url("${esc(hero)}")`:'linear-gradient(135deg,#06385a,#020916)'}"><div class="profile-head"><div class="profile-tag">CLUB // ${String(c.id).padStart(2,'0')}</div><div class="profile-name">${esc(c.name)}</div></div></div><div class="profile-body"><div class="profile-stats"><div class="pstat"><b>${fmt(c.people)}</b><span>PEOPLE</span></div><div class="pstat"><b>${fmt(c.active)}</b><span>ACTIVE NOW</span></div></div><div class="wiki-title">WIKI // PROFILE</div><div class="wiki">${wikiHtml(c.wiki)}</div><div class="wiki-title">HOVER // PREVIEW</div><div class="wiki">${esc(c.hoverText)}</div><div class="wiki-title">CONNECTED TRAITS</div><div class="connections">${(c.tags||[]).map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div><div class="wiki-title">VECTOR</div><div class="wiki">Approx. <b>${distance(c)} KM</b> from the current world vector.</div></div>`;document.getElementById('vectorDistance').textContent=distance(c)+' KM'}

document.getElementById('closePanel').onclick=()=>document.getElementById('profilePanel').classList.add('closed');
document.getElementById('resetBtn').onclick=()=>{view={x:0,y:0,zoom:.58};toast('World vector recentered')};
document.getElementById('zoomIn').onclick=()=>view.zoom=Math.min(2.5,view.zoom*1.18);document.getElementById('zoomOut').onclick=()=>view.zoom=Math.max(.25,view.zoom*.85);document.getElementById('zoomReset').onclick=()=>view.zoom=.58;
const previews=document.getElementById('clubPreview');clubs.forEach(c=>{const el=document.createElement('div');el.className='preview';el.innerHTML=`<div class="preview-dot" style="background:${esc(c.color||'#25c8ff')}"></div><span>${esc(c.name)}</span>`;el.onclick=()=>focus(c);previews.appendChild(el)});
document.getElementById('searchInput').addEventListener('keydown',e=>{if(e.key!=='Enter')return;const q=e.target.value.trim().toLowerCase();const c=clubs.find(x=>x.name.toLowerCase()===q)||clubs.find(x=>x.name.toLowerCase().includes(q));if(c)focus(c);else toast('Club not found')});
document.getElementById('searchInput').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();if(!q)return;const c=clubs.find(x=>x.name.toLowerCase()===q);if(c)focus(c,false)});
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),1800)}
document.getElementById('applyUris').onclick=()=>{const w=document.getElementById('worldBgInput').value.trim();if(w){document.getElementById('mapBackground').style.backgroundImage=`url("${w}")`;CONFIG.worldBackgroundURI=w}toast('URI settings applied')};
function enterWorld(){const value=document.getElementById('familyInput').value.trim();if(!value){document.getElementById('warningError').textContent='Enter a family name to continue.';return}const family=clubs.find(c=>c.name.toLowerCase()===value.toLowerCase())||clubs.find(c=>c.name.toLowerCase().replace(/_/g,' ')===value.toLowerCase().replace(/_/g,' '));if(!family){document.getElementById('warningError').textContent='Family not found. Try one of the club names.';return}document.getElementById('warning').classList.add('hidden');document.getElementById('app').classList.remove('hidden');focus(family)}
document.getElementById('enterBtn').onclick=enterWorld;document.getElementById('familyInput').addEventListener('keydown',e=>{if(e.key==='Enter')enterWorld()});document.getElementById('clubCount').textContent=clubs.length.toLocaleString();document.getElementById('statClubs').textContent=clubs.length.toLocaleString();document.getElementById('statPeople').textContent=fmt(clubs.reduce((a,c)=>a+c.people,0));document.getElementById('titleBadge').textContent=CONFIG.titleBadge;
