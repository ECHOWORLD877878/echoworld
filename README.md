# ECHO//WORLD — 10 CLUB EDITION

Each map dot has its **own profile file** inside `clubs/`. You do NOT need to edit a giant list in `app.js`.

Example `clubs/02_Astra_Union.js`:

```js
export default {
  name:"My_Club",
  people:50000,
  active:7200,
  color:"#25c8ff",
  backgroundURI:"YOUR IMAGE URI",
  hoverText:"What appears when people hover.",
  wiki:"The full wiki description.",
  x:500,
  y:-300,
  tags:["Example","Tag"]
};
```

Edit the values in that one file and that one dot changes.

### Files
- `clubs/01_Hons_Family.js`
- `clubs/02_Astra_Union.js`
- `clubs/03_Hollow_Circle.js`
- `clubs/04_Neon_House.js`
- `clubs/05_Velvet_Order.js`
- `clubs/06_Night_Collective.js`
- `clubs/07_Silver_Guild.js`
- `clubs/08_Crimson_Family.js`
- `clubs/09_Static_Society.js`
- `clubs/10_Ghost_Network.js`

The map still has 10 slowly drifting locations, smooth dragging, zooming, connections, hover UI, wiki panels, and the built-in profile editor.
