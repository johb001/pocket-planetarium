import "./styles.css";
import type { AppState, Locale, Observation, ObserverLocation, Star } from "./types";
import { messages, type MessageKey } from "./i18n/messages";
import { loadLocale, saveLocale, toggleLocale } from "./i18n/locale";
import { createCatalogForSky } from "./sky/catalog";
import { getSkyMoment } from "./sky/time";
import { projectStar, renderSky } from "./sky/render";
import { findNearestStar, type StarHitPoint } from "./sky/hitTest";
import { getSolarSystemObjects } from "./sky/solarSystem";
import {
  createObservation,
  loadObservations,
  restoreObservationState,
  saveObservations
} from "./state/observations";

const CITY_PRESETS: ObserverLocation[] = [
  { label: "Hong Kong", latitude: 22.3193, longitude: 114.1694 },
  { label: "Beijing", latitude: 39.9042, longitude: 116.4074 },
  { label: "Shanghai", latitude: 31.2304, longitude: 121.4737 },
  { label: "New York", latitude: 40.7128, longitude: -74.006 },
  { label: "London", latitude: 51.5072, longitude: -0.1276 }
];

const queriedAppRoot = document.querySelector<HTMLDivElement>("#app");

if (!queriedAppRoot) {
  throw new Error("Pocket Planetarium requires an #app mount node.");
}

const appRoot = queriedAppRoot;
const defaultObservedAt = new Date();
const state: AppState = {
  nightValue: dateToNightValue(defaultObservedAt),
  selectedStarId: undefined,
  showConstellations: true,
  showLabels: true,
  observations: loadObservations(),
  locale: loadLocale(),
  observer: CITY_PRESETS[0],
  observedAt: defaultObservedAt.toISOString()
};

appRoot.innerHTML = `
  <main class="planetarium-shell" data-planetarium aria-label="Pocket Planetarium">
    <section class="sky-stage" data-role="sky-stage">
      <canvas class="sky-canvas" data-sky-canvas></canvas>
      <div class="sky-readout">
        <p class="sky-kicker">Pocket Planetarium</p>
        <h1 class="sky-time" data-role="time-label"></h1>
        <p class="selected-star" data-role="selected-star"></p>
      </div>
    </section>

    <aside class="control-dock" data-control-dock>
      <div class="dock-row">
        <h2 data-i18n="appName"></h2>
        <div class="segmented-control" data-segmented-control>
          <button type="button" data-role="locale-toggle"></button>
        </div>
      </div>

      <label class="field-group">
        <span data-i18n="cityLabel"></span>
        <select data-role="city-select"></select>
      </label>

      <div class="coordinate-grid">
        <label class="field-group">
          <span data-i18n="latitudeLabel"></span>
          <input data-role="latitude-input" type="number" min="-90" max="90" step="0.0001" />
        </label>
        <label class="field-group">
          <span data-i18n="longitudeLabel"></span>
          <input data-role="longitude-input" type="number" min="-180" max="180" step="0.0001" />
        </label>
      </div>

      <label class="field-group">
        <span data-i18n="dateTimeLabel"></span>
        <input data-role="datetime-input" type="datetime-local" />
      </label>

      <div class="dock-row">
        <button type="button" data-role="now-button"></button>
        <button type="button" class="button-secondary" data-role="location-button"></button>
      </div>

      <label class="field-group">
        <span data-i18n="nightArcLabel"></span>
        <input data-role="night-slider" type="range" min="0" max="1" step="0.01" />
      </label>

      <div class="control-row" role="group">
        <label>
          <input data-role="constellations-toggle" type="checkbox" />
          <span data-i18n="constellationsLabel"></span>
        </label>
        <label>
          <input data-role="labels-toggle" type="checkbox" />
          <span data-i18n="labelsLabel"></span>
        </label>
      </div>

      <p class="error-message" data-role="error-message"></p>

      <form class="control-group save-form" data-role="save-form">
        <label class="field-group">
          <span data-i18n="observationNameLabel"></span>
          <input data-role="observation-title" type="text" maxlength="48" autocomplete="off" />
        </label>
        <button type="submit" data-i18n="saveObservationButton"></button>
      </form>

      <section class="observations">
        <h2 data-i18n="savedObservationsHeading"></h2>
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
const localeToggle = mustFind<HTMLButtonElement>('[data-role="locale-toggle"]');
const citySelect = mustFind<HTMLSelectElement>('[data-role="city-select"]');
const latitudeInput = mustFind<HTMLInputElement>('[data-role="latitude-input"]');
const longitudeInput = mustFind<HTMLInputElement>('[data-role="longitude-input"]');
const dateTimeInput = mustFind<HTMLInputElement>('[data-role="datetime-input"]');
const nowButton = mustFind<HTMLButtonElement>('[data-role="now-button"]');
const locationButton = mustFind<HTMLButtonElement>('[data-role="location-button"]');
const nightSlider = mustFind<HTMLInputElement>('[data-role="night-slider"]');
const constellationsToggle = mustFind<HTMLInputElement>('[data-role="constellations-toggle"]');
const labelsToggle = mustFind<HTMLInputElement>('[data-role="labels-toggle"]');
const errorMessage = mustFind<HTMLElement>('[data-role="error-message"]');
const saveForm = mustFind<HTMLFormElement>('[data-role="save-form"]');
const observationTitleInput = mustFind<HTMLInputElement>('[data-role="observation-title"]');
const observationList = mustFind<HTMLElement>('[data-role="observation-list"]');

let canvasWidth = 1;
let canvasHeight = 1;

populateCitySelect();
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
  localeToggle.addEventListener("click", () => {
    const locale = toggleLocale(state.locale);
    saveLocale(locale);
    setState({ locale });
  });

  citySelect.addEventListener("change", () => {
    const selectedCity = CITY_PRESETS.find((city) => city.label === citySelect.value);
    if (selectedCity) {
      setState({ observer: selectedCity, errorMessage: undefined });
    }
  });

  latitudeInput.addEventListener("change", updateObserverFromInputs);
  longitudeInput.addEventListener("change", updateObserverFromInputs);

  dateTimeInput.addEventListener("change", () => {
    const date = localDateTimeInputToDate(dateTimeInput.value);
    if (Number.isNaN(date.getTime())) {
      setObservedDate(new Date());
      return;
    }
    setObservedDate(date);
  });

  nowButton.addEventListener("click", () => {
    setObservedDate(new Date());
  });

  locationButton.addEventListener("click", () => {
    requestBrowserLocation();
  });

  nightSlider.addEventListener("input", () => {
    const nextDate = nightValueToDate(Number.parseFloat(nightSlider.value), new Date(state.observedAt));
    setObservedDate(nextDate);
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

function setObservedDate(date: Date): void {
  setState({
    observedAt: date.toISOString(),
    nightValue: dateToNightValue(date)
  });
}

function syncControls(): void {
  const text = messages[state.locale];

  document.documentElement.lang = state.locale === "zh" ? "zh-CN" : "en";
  appRoot.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n as MessageKey;
    element.textContent = text[key];
  });
  localeToggle.textContent = state.locale === "zh" ? text.english : text.chinese;
  localeToggle.setAttribute("aria-label", text.languageLabel);
  citySelect.value = state.observer.label;
  latitudeInput.value = state.observer.latitude.toFixed(4);
  longitudeInput.value = state.observer.longitude.toFixed(4);
  dateTimeInput.value = dateToLocalInputValue(new Date(state.observedAt));
  nowButton.textContent = text.nowButton;
  locationButton.textContent = text.useLocationButton;
  nightSlider.value = state.nightValue.toFixed(2);
  constellationsToggle.checked = state.showConstellations;
  labelsToggle.checked = state.showLabels;
  errorMessage.textContent = state.errorMessage ?? "";
}

function populateCitySelect(): void {
  citySelect.replaceChildren(
    ...CITY_PRESETS.map((city) => {
      const option = document.createElement("option");
      option.value = city.label;
      option.textContent = city.label;
      return option;
    })
  );
}

function updateObserverFromInputs(): void {
  const latitude = Number.parseFloat(latitudeInput.value);
  const longitude = Number.parseFloat(longitudeInput.value);

  if (!isValidObserver(latitude, longitude)) {
    setState({ errorMessage: messages[state.locale].locationError });
    return;
  }

  setState({
    observer: { latitude, longitude, label: "Custom" },
    errorMessage: undefined
  });
}

function requestBrowserLocation(): void {
  if (!navigator.geolocation) {
    setState({ errorMessage: messages[state.locale].locationError });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setState({
        observer: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "Current"
        },
        errorMessage: undefined
      });
    },
    () => setState({ errorMessage: messages[state.locale].locationError }),
    { enableHighAccuracy: false, timeout: 8000 }
  );
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
  const observedAt = new Date(state.observedAt);
  const moment = getSkyMoment(state.nightValue);
  const catalog = buildVisibleCatalog(observedAt);
  const selectedStar = getSelectedStar(catalog.stars);
  const text = messages[state.locale];

  timeLabel.textContent = `${moment.label} · ${state.observer.label}`;
  selectedStarLabel.textContent = selectedStar
    ? formatSelectedStar(selectedStar)
    : text.tapStarHint;

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

function buildVisibleCatalog(observedAt: Date) {
  const starCatalog = createCatalogForSky({ observer: state.observer, observedAt });
  const solarSystemObjects = getSolarSystemObjects({ observer: state.observer, observedAt })
    .map(localizeSolarSystemObject);

  return {
    ...starCatalog,
    stars: [...starCatalog.stars, ...solarSystemObjects]
  };
}

function renderObservations(): void {
  const text = messages[state.locale];

  if (state.observations.length === 0) {
    observationList.innerHTML = `<p class="empty-state">${text.emptyObservations}</p>`;
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
  const catalog = buildVisibleCatalog(new Date(state.observedAt));
  const selectedStar = getSelectedStar(catalog.stars);
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

  const catalog = buildVisibleCatalog(new Date(state.observedAt));
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
  const catalog = buildVisibleCatalog(new Date(state.observedAt));

  return catalog.stars
    .map((star) => ({ star, projected: projectStar(star, moment, canvasWidth, canvasHeight) }))
    .filter(({ projected }) => projected.visible)
    .map(({ star, projected }) => ({ star, x: projected.x, y: projected.y }));
}

function getSelectedStar(stars: Star[]): Star | undefined {
  return state.selectedStarId
    ? stars.find((star) => star.id === state.selectedStarId)
    : undefined;
}

function formatSelectedStar(star: Star): string {
  const text = messages[state.locale];
  const altitude = star.altitude === undefined ? "" : ` · ${text.starAltitude}: ${star.altitude.toFixed(1)}°`;
  const azimuth = star.azimuth === undefined ? "" : ` · ${text.starAzimuth}: ${star.azimuth.toFixed(1)}°`;

  return `${star.name} · ${text.starMagnitude}: ${star.magnitude.toFixed(2)}${altitude}${azimuth}`;
}

function defaultObservationTitle(star: Star | undefined): string {
  const moment = getSkyMoment(state.nightValue);
  const text = messages[state.locale];

  return star ? `${star.name} ${moment.label}` : `${text.defaultObservationTitle} ${moment.label}`;
}

function localizeSolarSystemObject(star: Star): Star {
  const keyById: Record<string, MessageKey> = {
    "body-sun": "sunName",
    "body-moon": "moonName",
    "body-mercury": "mercuryName",
    "body-venus": "venusName",
    "body-mars": "marsName",
    "body-jupiter": "jupiterName",
    "body-saturn": "saturnName"
  };
  const key = keyById[star.id];

  return key ? { ...star, name: messages[state.locale][key] } : star;
}

function dateToNightValue(date: Date): number {
  const hour = date.getHours() + date.getMinutes() / 60;
  const shifted = hour >= 18 ? hour - 18 : hour + 6;

  return Math.min(1, Math.max(0, shifted / 12));
}

function nightValueToDate(value: number, baseDate: Date): Date {
  const date = new Date(baseDate);
  const totalMinutes = Math.round(value * 12 * 60);
  const hour = (18 + Math.floor(totalMinutes / 60)) % 24;
  const minute = totalMinutes % 60;

  date.setHours(hour, minute, 0, 0);
  return date;
}

function dateToLocalInputValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function localDateTimeInputToDate(value: string): Date {
  return new Date(value);
}

function isValidObserver(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function formatDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return "saved";
  }

  return new Intl.DateTimeFormat(state.locale === "zh" ? "zh-CN" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
