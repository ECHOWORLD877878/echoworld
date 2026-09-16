# ECHO//WORLD — SCROLLING WIKI UPDATE

The profile/wiki panel is now a fixed-height panel with its own scroll area.

Long wikis no longer push the rest of the profile off-screen.

Wiki arrays are displayed as separate entries:

```js
wiki: [
  "First section.",
  "Second section.",
  "Third section."
],
```

Each entry is shown as:

`()< First section. >()`

The profile editor accepts one wiki entry per line.
