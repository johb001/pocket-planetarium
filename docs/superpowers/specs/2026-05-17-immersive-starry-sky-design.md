# Immersive Starry Sky Design

## Goal

Make Pocket Planetarium feel like opening a night sky, not a technical control panel with scattered dots.

## Scope

This pass changes visual atmosphere only. It keeps the real bright-star catalog, solar-system calculations, bilingual controls, saved observations, and GitHub Pages deployment model.

## Visual Direction

- Add a dense deterministic background star layer behind real stars.
- Add a soft Milky Way style band as a low-contrast atmospheric layer.
- Draw the sky as a recognizable circular star dome with horizon rim, altitude rings, crosshair axes, and N/E/S/W compass marks.
- Make real bright stars more luminous with magnitude-based glow and color.
- Keep constellation lines visible but secondary.
- Reduce the control dock's visual weight so the sky is the first thing users notice.

## Technical Design

The Canvas renderer remains the owner of sky visuals. `src/sky/render.ts` will add deterministic atmosphere helpers so tests can verify the background layer without snapshot images. CSS in `src/styles.css` will make the dock more translucent and move readout text into a subtle overlay style.

## Testing

Add unit tests for deterministic atmosphere star generation:

- Same viewport and moment produce the same stars.
- Generated stars stay inside the sky dome.
- The atmosphere layer creates enough stars to read as a sky field.

Existing render, catalog, i18n, deployment, and state tests must continue to pass.
