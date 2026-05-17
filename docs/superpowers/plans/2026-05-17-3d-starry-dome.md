# 3D Starry Dome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat main star map with a Three.js 3D star dome and make the controls non-blocking by default.

**Architecture:** Add a focused `src/sky/render3d.ts` module for WebGL scene setup and pure geometry helpers. Keep state management in `src/main.ts`; keep 2D canvas functions in `src/sky/render.ts` for thumbnails and tests.

**Tech Stack:** TypeScript, Three.js, Vite, Vitest, jsdom.

---

### Task 1: 3D Geometry Helpers

**Files:**
- Create: `src/sky/render3d.ts`
- Create: `test/render3d.test.ts`

- [ ] Write tests for `projectStarToDome` and `createDomeAtmosphereStars`.
- [ ] Run `npm test -- test/render3d.test.ts` and confirm it fails because the module is missing.
- [ ] Implement pure helper functions in `src/sky/render3d.ts`.
- [ ] Run `npm test -- test/render3d.test.ts` and confirm it passes.

### Task 2: Three.js Renderer

**Files:**
- Modify: `src/sky/render3d.ts`
- Modify: `src/main.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Install `three`.
- [ ] Add `createSkyDomeRenderer(canvas)` with scene, camera, WebGLRenderer, star groups, line groups, resize, render, interaction, and dispose methods.
- [ ] Wire the main canvas in `src/main.ts` to use the 3D renderer instead of `renderSky`.
- [ ] Preserve `projectStar` and hit testing by continuing to use existing 2D projection only for click target calculations.

### Task 3: Collapsible Controls

**Files:**
- Modify: `src/main.ts`
- Modify: `src/styles.css`

- [ ] Add a settings toggle button and close button.
- [ ] Default the control dock to closed.
- [ ] Add CSS for desktop right drawer and mobile bottom drawer.
- [ ] Ensure the sky readout remains visible and the dock no longer dominates the first screen.

### Task 4: Verification

**Files:**
- No source changes unless verification finds a defect.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Start local dev server.
- [ ] Open the app in the browser.
- [ ] Capture a screenshot.
- [ ] Sample canvas pixels to confirm WebGL is rendering nonblank content.
