const clubData = [
  { name: "Hon's Family", people: '670K', active: '100K', distance: '4,821', location: 'Pacific Rim', tag: 'LARGEST SIGNAL', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=80', wiki: "A high-orbit family built around the quiet exchange of ideas, ritual, and radical hospitality. Hon's signal reaches furthest at dusk, when thousands gather to leave a trace for the next person.", x: 67, y: 42, signal: 'hot' },
  { name: 'Afterimage', people: '214K', active: '32K', distance: '1,204', location: 'North Arc', tag: 'RISING FAST', image: 'https://images.unsplash.com/photo-1534791547706-3c59e7fe2c2a?auto=format&fit=crop&w=700&q=80', wiki: 'A visual culture club where unfinished work is the only finished language. Members trade fragments and let the collective complete the thought.', x: 33, y: 31, signal: 'warm' },
  { name: 'Low Signal', people: '89K', active: '7.8K', distance: '2,660', location: 'The Lowlands', tag: 'QUIET ORBIT', image: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=700&q=80', wiki: 'For people who prefer the edge of the room. Low Signal gathers slowly, listens closely, and rarely needs to repeat itself.', x: 42, y: 76, signal: 'cool' },
  { name: 'Morrow Club', people: '156K', active: '21K', distance: '3,008', location: 'East Meridian', tag: 'RISING FAST', image: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=700&q=80', wiki: 'A forward-facing circle for builders, dreamers, and the people who make the first move before the map has a name.', x: 78, y: 61, signal: 'warm' },
  { name: 'Soft Focus', people: '73K', active: '11K', distance: '890', location: 'West Shelf', tag: 'QUIET ORBIT', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=80', wiki: 'A place to slow the frame rate. Soft Focus believes attention is a form of generosity.', x: 20, y: 59, signal: 'cool' },
  { name: 'Common Ground', people: '302K', active: '48K', distance: '5,720', location: 'South Arc', tag: 'HIGH SIGNAL', image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=700&q=80', wiki: 'An open table without a center. The largest conversations here are the ones that make room for someone new.', x: 55, y: 20, signal: 'hot' },
  { name: 'Blue Hour', people: '42K', active: '5.3K', distance: '1,992', location: 'Pacific Rim', tag: 'QUIET ORBIT', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80', wiki: 'The liminal club. Members arrive between one thing and the next, bringing stories that only make sense for a minute.', x: 87, y: 78, signal: 'cool' },
  { name: 'New Ritual', people: '118K', active: '18K', distance: '4,100', location: 'North Arc', tag: 'RISING FAST', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80', wiki: 'A living laboratory for habits worth keeping. New Ritual turns small repeated acts into a shared language.', x: 13, y: 18, signal: 'warm' }
];

const mapViewport = document.querySelector('#mapViewport');
const mapWorld = document.querySelector('#mapWorld');
const clubLayer = document.querySelector('#clubLayer');
const clubPanel = document.querySelector('#clubPanel');
let selectedClub = clubData[0];
let scale = 1;
let position = { x: 0, y: 0 };
let drag = null;

function renderClubs() {
  clubLayer.innerHTML = clubData.map((club, index) => `
    <button class="club-node ${index === 0 ? 'selected' : ''}" data-club="${index}" style="left:${club.x}%;top:${club.y}%;background-image:url('${club.image}')" aria-label="Open ${club.name} profile">
      <span class="node-signal"></span><span class="node-inner"><span class="node-name">${club.name}</span><span class="node-count">${club.people} people</span></span>
    </button>`).join('');
  clubLayer.querySelectorAll('.club-node').forEach(node => {
    node.addEventListener('click', event => { event.stopPropagation(); selectClub(Number(node.dataset.club)); });
  });
}

function selectClub(index) {
  selectedClub = clubData[index];
  document.querySelectorAll('.club-node').forEach(node => node.classList.toggle('selected', Number(node.dataset.club) === index));
  document.querySelector('#clubRank').textContent = `${String(index + 1).padStart(2, '0')} / 3,000`;
  document.querySelector('#clubName').textContent = selectedClub.name;
  document.querySelector('#clubLocation').textContent = `${selectedClub.location} · ${selectedClub.distance} km away`;
  document.querySelector('#clubPeople').textContent = selectedClub.people;
  document.querySelector('#clubActive').textContent = selectedClub.active;
  document.querySelector('#clubDistance').textContent = selectedClub.distance;
  document.querySelector('#clubTag').textContent = selectedClub.tag;
  document.querySelector('#clubWiki').textContent = selectedClub.wiki;
  document.querySelector('#clubCover').style.backgroundImage = `url('${selectedClub.image}')`;
}

function updateMap() { mapWorld.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`; }
function zoom(delta) { scale = Math.min(1.42, Math.max(.68, scale + delta)); updateMap(); }

mapViewport.addEventListener('pointerdown', event => { if (event.target.closest('.club-node')) return; drag = { x: event.clientX, y: event.clientY, startX: position.x, startY: position.y }; mapViewport.setPointerCapture(event.pointerId); });
mapViewport.addEventListener('pointermove', event => { if (!drag) return; position.x = drag.startX + event.clientX - drag.x; position.y = drag.startY + event.clientY - drag.y; updateMap(); });
mapViewport.addEventListener('pointerup', () => { drag = null; });
mapViewport.addEventListener('pointercancel', () => { drag = null; });
mapViewport.addEventListener('wheel', event => { event.preventDefault(); zoom(event.deltaY > 0 ? -.06 : .06); }, { passive: false });
document.querySelector('#zoomIn').addEventListener('click', () => zoom(.1));
document.querySelector('#zoomOut').addEventListener('click', () => zoom(-.1));
document.querySelector('#recenterButton').addEventListener('click', () => { position = { x: 0, y: 0 }; scale = 1; updateMap(); });
document.querySelector('#closeDetail').addEventListener('click', () => clubPanel.classList.toggle('is-minimized'));

const welcomeModal = document.querySelector('#welcomeModal');
const familyInput = document.querySelector('#familyInput');
function enterAtlas(familyName) {
  welcomeModal.classList.add('is-hidden');
  if (familyName.trim().toLowerCase().replaceAll(' ', '_') === "hon's_family") {
    selectClub(0);
    position = { x: -180, y: 34 };
    scale = 1.1;
    updateMap();
  }
}
document.querySelector('#familyForm').addEventListener('submit', event => { event.preventDefault(); enterAtlas(familyInput.value); });
document.querySelector('#wanderButton').addEventListener('click', () => enterAtlas(''));

renderClubs();
selectClub(0);
setInterval(() => {
  const pulse = (68.4 + Math.random() * 1.8 - .9).toFixed(1);
  document.querySelector('#pulseNumber').innerHTML = `${pulse}<span>%</span>`;
}, 3200);
