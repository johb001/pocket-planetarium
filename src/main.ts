import "./styles.css";
import type { AppState, Observation, Star } from "./types";
import { createCatalog } from "./sky/catalog";
import { getSkyMoment } from "./sky/time";
import { projectStar, renderSky } from "./sky/render";
import { findNearestStar, type StarHitPoint } from "./sky/hitTest";
import {
  createObservation,
  loadObservations,
  restoreObservationState,
  saveObservations
} from "./state/observations";

const catalog = createCatalog();
const queriedAppRoot = document.querySelector<HTMLDivElement>("#app");

if (!queriedAppRoot) {
  throw new Error("Pocket Planetarium requires an #app mount node.");
}

const appRoot = queriedAppRoot;
const state: AppState = {
  nightValue: 0.52,
  selectedStarId: undefined,
  showConstellations: true,
  showLabels: true,
  observations: loadObservations()
};

appRoot.innerHTML = `
  <main class="planetarium-shell" data-planetarium aria-label="Pocket Planetarium">
    <section class="sky-stage" aria-label="Interactive sky">
      <canvas class="sky-canvas" data-sky-canvas aria-label="Star map"></canvas>
      <div class="sky-readout">
        <p class="sky-kicker">Pocket Planetarium</p>
        <h1 class="sky-time" data-role="time-label"></h1>
        <p class="selected-star" data-role="selected-star"></p>
      </div>
    </section>

    <aside class="control-dock" data-control-dock aria-label="Observation controls">
      <label class="field-group">
        <span>Night arc</span>
        <input data-role="night-slider" type="range" min="0" max="1" step="0.01" />
      </label>

      <div class="control-row" role="group" aria-label="Sky layers">
        <label>
          <input data-role="constellations-toggle" type="checkbox" />
          <span>Constellations</span>
        </label>
        <label>
          <input data-role="labels-toggle" type="checkbox" />
          <span>Labels</span>
        </label>
      </div>

      <form class="control-group save-form" data-role="save-form">
        <label class="field-group">
          <span>Observation name</span>
          <input data-role="observation-title" type="text" maxlength="48" autocomplete="off" />
        </label>
        <button type="submit">Save observation</button>
      </form>

      <section class="observations" aria-label="Saved observations">
        <h2>Saved observations</h2>
        <div class="observation-list" data-role="observation-list"></div>
      </section>
    </aside>
  </main>
`;

const canvas = mustFind<HTMLCanvasElement>(".sky-canvas");
const renderingContext = canvas.getContext("2d");

if (!renderingContext) {
  throw new Error("Pocket Planetarium could not create a 2D canvas context.");
}

const context = renderingContext;
const timeLabel = mustFind<HTMLElement>('[data-role="time-label"]');
const selectedStarLabel = mustFind<HTMLElement>('[data-role="selected-star"]');
const nightSlider = mustFind<HTMLInputElement>('[data-role="night-slider"]');
const constellationsToggle = mustFind<HTMLInputElement>('[data-role="constellations-toggle"]');
const labelsToggle = mustFind<HTMLInputElement>('[data-role="labels-toggle"]');
const saveForm = mustFind<HTMLFormElement>('[data-role="save-form"]');
const observationTitleInput = mustFind<HTMLInputElement>('[data-role="observation-title"]');
const observationList = mustFind<HTMLElement>('[data-role="observation-list"]');

let canvasWidth = 1;
let canvasHeight = 1;

bindEvents();
syncControls();
resizeCanvas();
render();

function mustFind<T extends Element>(selector: string): T {
  const element = appRoot.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Pocket Planetarium missing DOM node: ${selector}`);
  }

  return element;
}

function bindEvents(): void {
  nightSlider.addEventListener("input", () => {
    setState({ nightValue: Number.parseFloat(nightSlider.value) });
  });

  constellationsToggle.addEventListener("change", () => {
    setState({ showConstellations: constellationsToggle.checked });
  });

  labelsToggle.addEventListener("change", () => {
    setState({ showLabels: labelsToggle.checked });
  });

  canvas.addEventListener("click", (event) => {
    const star = pickStar(event);
    setState({ selectedStarId: star?.id });
  });

  saveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveCurrentObservation();
  });

  observationList.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-observation-id]");

    if (!button) {
      return;
    }

    restoreObservation(button.dataset.observationId);
  });

  const ResizeObserverClass = typeof ResizeObserver === "undefined" ? undefined : ResizeObserver;

  if (ResizeObserverClass) {
    new ResizeObserverClass(resizeCanvas).observe(canvas);
  } else {
    addEventListener("resize", resizeCanvas);
  }
}

function setState(nextState: Partial<AppState>): void {
  Object.assign(state, nextState);
  syncControls();
  render();
}

function syncControls(): void {
  nightSlider.value = state.nightValue.toFixed(2);
  constellationsToggle.checked = state.showConstellations;
  labelsToggle.checked = state.showLabels;
}

function resizeCanvas(): void {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const pixelWidth = Math.round(width * pixelRatio);
  const pixelHeight = Math.round(height * pixelRatio);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    canvasWidth = width;
    canvasHeight = height;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  render();
}

function render(): void {
  const moment = getSkyMoment(state.nightValue);
  const selectedStar = getSelectedStar();

  timeLabel.textContent = moment.label;
  selectedStarLabel.textContent = selectedStar
    ? `${selectedStar.name} - ${selectedStar.note}`
    : "Tap a star to inspect it.";

  renderSky(context, {
    catalog,
    moment,
    width: canvasWidth,
    height: canvasHeight,
    selectedStarId: state.selectedStarId,
    showConstellations: state.showConstellations,
    showLabels: state.showLabels
  });

  renderObservations();
}

function renderObservations(): void {
  if (state.observations.length === 0) {
    observationList.innerHTML = `<p class="empty-state">No saved observations yet.</p>`;
    return;
  }

  observationList.replaceChildren(
    ...state.observations.map((observation) => createObservationButton(observation))
  );
}

function createObservationButton(observation: Observation): HTMLButtonElement {
  const button = document.createElement("button");
  const skyMoment = getSkyMoment(observation.nightValue);
  const createdAt = new Date(observation.createdAt);

  button.type = "button";
  button.className = "observation-card";
  button.dataset.observationId = observation.id;
  button.style.borderColor = observation.accent;
  button.innerHTML = `
    <span class="observation-title"></span>
    <span class="observation-meta"></span>
  `;

  button.querySelector(".observation-title")!.textContent = observation.title;
  button.querySelector(".observation-meta")!.textContent = `${skyMoment.label} - ${formatDate(createdAt)}`;

  return button;
}

function saveCurrentObservation(): void {
  const selectedStar = getSelectedStar();
  const title = observationTitleInput.value.trim() || defaultObservationTitle(selectedStar);
  const nextObservation = createObservation({
    title,
    nightValue: state.nightValue,
    selectedStarId: state.selectedStarId,
    accent: selectedStar ? `hsl(${selectedStar.hue}, 86%, 70%)` : "#8bd3ff"
  });
  const observations = [nextObservation, ...state.observations].slice(0, 8);

  saveObservations(observations);
  observationTitleInput.value = "";
  setState({ observations });
}

function restoreObservation(observationId: string | undefined): void {
  const observation = state.observations.find((item) => item.id === observationId);

  if (!observation) {
    return;
  }

  setState(restoreObservationState(observation, catalog.stars));
}

function pickStar(event: MouseEvent): Star | undefined {
  const rect = canvas.getBoundingClientRect();
  const pointer = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };

  return findNearestStar(projectStarsForHitTesting(), pointer, 18);
}

function projectStarsForHitTesting(): StarHitPoint[] {
  const moment = getSkyMoment(state.nightValue);

  return catalog.stars
    .map((star) => ({ star, projected: projectStar(star, moment, canvasWidth, canvasHeight) }))
    .filter(({ projected }) => projected.visible)
    .map(({ star, projected }) => ({ star, x: projected.x, y: projected.y }));
}

function getSelectedStar(): Star | undefined {
  return state.selectedStarId
    ? catalog.stars.find((star) => star.id === state.selectedStarId)
    : undefined;
}

function defaultObservationTitle(star: Star | undefined): string {
  const moment = getSkyMoment(state.nightValue);

  return star ? `${star.name} at ${moment.label}` : `Sky at ${moment.label}`;
}

function formatDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return "saved";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
