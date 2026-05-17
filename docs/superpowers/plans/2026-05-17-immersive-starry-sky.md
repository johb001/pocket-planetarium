# Immersive Starry Sky Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the app visually read as an immersive starry sky while preserving the current astronomy behavior.

**Architecture:** Keep rendering in `src/sky/render.ts`, with deterministic helper functions for background atmosphere stars and sky dome metrics. Keep UI structure in `src/main.ts`; only adjust styling in `src/styles.css`.

**Tech Stack:** TypeScript, Canvas 2D, Vite, Vitest, jsdom.

---

### Task 1: Atmosphere Star Tests

**Files:**
- Create: `test/atmosphere.test.ts`
- Modify: `src/sky/render.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";
import { createAtmosphereStars } from "../src/sky/render";

describe("atmosphere star field", () => {
  test("creates a deterministic dense star layer inside the dome", () => {
    const first = createAtmosphereStars({
      width: 1200,
      height: 800,
      rotation: 0.42,
      compact: false
    });
    const second = createAtmosphereStars({
      width: 1200,
      height: 800,
      rotation: 0.42,
      compact: false
    });

    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThanOrEqual(210);
    expect(first.every((star) => star.x >= 0 && star.x <= 1200)).toBe(true);
    expect(first.every((star) => star.y >= 0 && star.y <= 800)).toBe(true);
    expect(first.every((star) => star.alpha > 0 && star.alpha <= 0.72)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- test/atmosphere.test.ts`

Expected: FAIL because `createAtmosphereStars` is not exported.

- [ ] **Step 3: Implement deterministic atmosphere helpers**

Add `AtmosphereStar`, `createAtmosphereStars`, a seeded hash/noise function, and a dome inclusion check in `src/sky/render.ts`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- test/atmosphere.test.ts`

Expected: PASS.

### Task 2: Immersive Canvas Rendering

**Files:**
- Modify: `src/sky/render.ts`

- [ ] **Step 1: Draw atmospheric layers**

Use `createAtmosphereStars` in `drawSky` after background and before constellations. Add Milky Way haze, sky vignette, dome rim, altitude rings, axes, and compass labels.

- [ ] **Step 2: Keep real stars prominent**

Refine `drawStars` so bright stars have a faint outer glow, a small core, and a subtle cross flare for the brightest objects.

- [ ] **Step 3: Verify render-related tests**

Run: `npm test -- test/atmosphere.test.ts test/hitTest.test.ts test/catalog.test.ts`

Expected: PASS.

### Task 3: UI Weight Reduction

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Make the sky dominant**

Darken the page background, make the dock more translucent, reduce its shadow, and style `.sky-readout` as a subtle glass overlay.

- [ ] **Step 2: Verify build**

Run: `npm run build`

Expected: PASS.

### Task 4: Full Verification and Visual QA

**Files:**
- No source changes unless QA reveals a defect.

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: 10 test files passing after the new atmosphere test is added.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Open local app in browser**

Run: `npm run dev -- --port 5174`, open `http://127.0.0.1:5174/pocket-planetarium/`, and inspect the screenshot for a dense starry sky, visible compass/rings, and non-dominant controls.
