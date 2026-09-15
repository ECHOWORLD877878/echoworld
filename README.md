# ECHO//WORLD

A high-quality blue/white interactive club-network map prototype.

## Run it

Open `index.html` in a browser, or use the Live Server extension in VS Code/Codespaces.

## Customize your URIs

Open `app.js` and edit:

```js
const CONFIG = {
  worldBackgroundURI: "YOUR_MAP_BACKGROUND_URL",
  customClubs: {
    "Hon's_Family": {
      backgroundURI: "YOUR_HONS_PROFILE_IMAGE_URL"
    }
  }
};
```

There is also a small URI control at the top-left of the map: hover over it to reveal the fields and apply URLs without editing code.

## What is included

- ECHO//WORLD title + LIVE badge
- Full-screen dark map with blue/white glow
- 3,000 generated clubs
- Drag / pan in every direction
- Scroll-wheel zoom centered around the cursor
- Animated network connections
- Hover cards showing people, activity and live distance
- Click/double-click to focus a club and open its wiki profile
- Side profile UI with custom club image, people, active count, wiki and tags
- Distance changes as the map vector moves
- Opening family gate
- `Hon's_Family` focuses immediately on the largest club: 670K people / 100K active
- Search box
- Responsive layout

## Important

The 3,000 clubs are demo-generated. Replace `customClubs` / the generation section with your real club database when you connect a backend.
