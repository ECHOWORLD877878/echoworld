# ECHO//WORLD — stable 10-club build

## Why the previous build broke
The ZIP you uploaded did not contain `app.js`, while `index.html` still loaded it. That meant the warning gate had no working JavaScript behind it, so entering a family could not open/focus the map.

This build includes `app.js` and 10 separate club files.

## Edit ONE club at a time
Open `clubs/01_Hons_Family.js`, for example:

```js
export default {
  name:"Hon's_Family",
  people:670000,
  active:100000,
  color:"#ff2525",
  backgroundURI:"",
  hoverText:"The largest known family network in ECHO//WORLD.",
  wiki:[
    "First wiki section.",
    "Second wiki section.",
    "Third wiki section."
  ],
  x:0,
  y:0,
  tags:["Largest Family","Anchor"]
};
```

The `wiki` field can be either an array (recommended) or a normal string. Every array entry is displayed as its own neat `()< ... >()` block.

## Search / gate
`Hon's_Family` works case-insensitively and also tolerates spaces vs underscores. Entering it opens the world and automatically centers the map on Hon's_Family.

## Movement
The 10 dots slowly drift around their home positions. Drag anywhere on the map to move in all directions. Mouse-wheel zoom is centered around the cursor. Clicking or searching a club focuses it.

## Adding a club
Create a new file in `clubs/`, export one object, then add one `import("./clubs/FILE.js")` line in `app.js`. The profile data itself remains in that club's own file.
