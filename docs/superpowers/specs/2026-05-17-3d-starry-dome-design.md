# 3D Starry Dome Design

## Goal

Make the main experience feel spatial and immersive, with a real 3D star dome and controls that do not block the sky by default.

## Scope

This pass upgrades the primary sky canvas to Three.js/WebGL. Existing astronomy calculations, bilingual UI, observations, tests, and 2D thumbnail rendering stay intact.

## Experience

- Full-screen 3D star dome with real bright stars as glowing points on a hemispherical shell.
- Deterministic faint stars fill the far dome to create depth and parallax.
- Constellation lines become thin 3D line segments.
- The scene slowly breathes with a tiny automatic rotation; pointer drag rotates the dome slightly.
- The right control dock is closed by default. A compact settings button opens it as a sliding drawer.
- A close button hides the drawer so the sky remains the main view.

## Technical Design

- Add `src/sky/render3d.ts` for Three.js scene creation, star projection, object updates, resize, render, and disposal.
- Keep `src/sky/render.ts` for pure 2D rendering, thumbnails, and deterministic atmosphere helpers.
- `src/main.ts` owns the app state and calls the 3D renderer for the main canvas.
- `src/styles.css` owns the drawer states and smaller overlay controls.

## Testing

- Unit test pure 3D projection helpers to ensure visible stars produce dome coordinates with depth.
- Unit test deterministic 3D atmosphere stars to ensure far stars have varied depths.
- Keep all existing tests passing.
- Verify in browser with a screenshot and canvas pixel sampling.
