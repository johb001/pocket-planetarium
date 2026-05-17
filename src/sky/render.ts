import type { Observation, SkyMoment, Star, StarCatalog } from "../types";

export interface ProjectedStar {
  id: string;
  name: string;
  note: string;
  magnitude: number;
  hue: number;
  x: number;
  y: number;
  visible: boolean;
}

export interface RenderSkyOptions {
  catalog: StarCatalog;
  moment: SkyMoment;
  width: number;
  height: number;
  selectedStarId?: string;
  showConstellations?: boolean;
  showLabels?: boolean;
}

export interface RenderObservationThumbnailOptions {
  catalog: StarCatalog;
  observation: Observation;
  moment: SkyMoment;
  width: number;
  height: number;
}

export interface AtmosphereStar {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  hue: number;
}

export interface CreateAtmosphereStarsOptions {
  width: number;
  height: number;
  rotation: number;
  compact: boolean;
}

interface DrawSkyOptions extends RenderSkyOptions {
  compact: boolean;
}

const TAU = Math.PI * 2;
const SKY_PADDING_RATIO = 0.08;
const DOME_RADIUS_RATIO = 0.47;

export function projectStar(
  star: Star,
  moment: SkyMoment,
  width: number,
  height: number
): ProjectedStar {
  if (star.visible === false) {
    return {
      id: star.id,
      name: star.name,
      note: star.note,
      magnitude: star.magnitude,
      hue: star.hue,
      x: star.x,
      y: star.y,
      visible: false
    };
  }

  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const radius = Math.min(safeWidth, safeHeight) * (0.5 - SKY_PADDING_RATIO);
  const centerX = safeWidth / 2;
  const centerY = safeHeight / 2;
  const normalizedX = (star.x - 50) / 50;
  const normalizedY = (star.y - 50) / 50;
  const angle = Math.atan2(normalizedY, normalizedX) + moment.rotation;
  const distance = Math.min(1.1, Math.hypot(normalizedX, normalizedY));
  const domeDistance = Math.sin((Math.min(1, distance) * Math.PI) / 2);
  const x = centerX + Math.cos(angle) * domeDistance * radius;
  const y = centerY + Math.sin(angle) * domeDistance * radius * 0.84;

  return {
    id: star.id,
    name: star.name,
    note: star.note,
    magnitude: star.magnitude,
    hue: star.hue,
    x,
    y,
    visible: distance <= 1.04
  };
}

export function renderSky(ctx: CanvasRenderingContext2D, options: RenderSkyOptions): void {
  drawSky(ctx, { ...options, compact: false });
}

export function renderObservationThumbnail(
  ctx: CanvasRenderingContext2D,
  options: RenderObservationThumbnailOptions
): void {
  drawSky(ctx, {
    catalog: options.catalog,
    moment: {
      ...options.moment,
      value: options.observation.nightValue
    },
    width: options.width,
    height: options.height,
    selectedStarId: options.observation.selectedStarId,
    showConstellations: true,
    showLabels: false,
    compact: true
  });
}

export function createAtmosphereStars(options: CreateAtmosphereStarsOptions): AtmosphereStar[] {
  const width = Math.max(1, options.width);
  const height = Math.max(1, options.height);
  const starCount = options.compact
    ? Math.round(Math.min(width, height) * 0.18)
    : Math.round(Math.min(width, height) * 0.34);
  const stars: AtmosphereStar[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = width * DOME_RADIUS_RATIO;
  const radiusY = height * 0.43;
  const rotationSeed = Math.round(options.rotation * 1000);

  for (let index = 0; stars.length < starCount && index < starCount * 8; index += 1) {
    const angle = seededNoise(index, rotationSeed, 11) * TAU;
    const distance = Math.sqrt(seededNoise(index, rotationSeed, 23));
    const x = centerX + Math.cos(angle) * distance * radiusX;
    const y = centerY + Math.sin(angle) * distance * radiusY;

    if (!isInsideDome(x, y, width, height)) {
      continue;
    }

    const brightness = seededNoise(index, rotationSeed, 37);
    stars.push({
      x: roundCanvasValue(x),
      y: roundCanvasValue(y),
      radius: roundCanvasValue(options.compact ? 0.35 + brightness * 0.75 : 0.42 + brightness * 1.05),
      alpha: roundCanvasValue(0.12 + brightness * 0.52),
      hue: Math.round(205 + seededNoise(index, rotationSeed, 43) * 48)
    });
  }

  return stars;
}

function drawSky(ctx: CanvasRenderingContext2D, options: DrawSkyOptions): void {
  const width = Math.max(1, options.width);
  const height = Math.max(1, options.height);
  const projectedStars = new Map(
    options.catalog.stars.map((star) => [star.id, projectStar(star, options.moment, width, height)])
  );
  const selectedStar = options.selectedStarId
    ? projectedStars.get(options.selectedStarId)
    : undefined;

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, options.moment, width, height);
  drawHorizonGlow(ctx, options.moment, width, height);
  drawSkyVignette(ctx, width, height);
  clipToDome(ctx, width, height);
  drawMilkyWay(ctx, options.moment, width, height, options.compact);
  drawAtmosphereStars(ctx, createAtmosphereStars({
    width,
    height,
    rotation: options.moment.rotation,
    compact: options.compact
  }));
  drawSkyGrid(ctx, width, height, options.compact);

  if (options.showConstellations ?? true) {
    drawConstellations(ctx, options.catalog, projectedStars, options.compact);
  }

  drawStars(ctx, projectedStars, options.compact);

  if ((options.showLabels ?? true) && !options.compact) {
    drawLabels(ctx, projectedStars, options.moment, options.selectedStarId);
  }

  if (selectedStar?.visible) {
    drawSelectedStar(ctx, selectedStar, options.compact);
  }

  ctx.restore();

  if (!options.compact) {
    drawCompass(ctx, width, height);
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, moment: SkyMoment, width: number, height: number): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, moment.colors.zenith);
  gradient.addColorStop(0.72, blendWithAlpha(moment.colors.zenith, 0.88));
  gradient.addColorStop(1, moment.colors.horizon);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawHorizonGlow(ctx: CanvasRenderingContext2D, moment: SkyMoment, width: number, height: number): void {
  const glow = ctx.createRadialGradient(width / 2, height * 0.86, 0, width / 2, height * 0.86, width * 0.68);
  const nightDepth = 1 - Math.abs(moment.value - 0.5) * 2;
  const glowAlpha = 0.16 + nightDepth * 0.05;
  glow.addColorStop(0, blendWithAlpha(moment.colors.glow, glowAlpha));
  glow.addColorStop(0.5, blendWithAlpha(moment.colors.glow, glowAlpha * 0.34));
  glow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

function drawSkyVignette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.72);
  vignette.addColorStop(0, "rgba(255, 255, 255, 0)");
  vignette.addColorStop(0.42, "rgba(0, 0, 0, 0.05)");
  vignette.addColorStop(0.78, "rgba(0, 0, 0, 0.34)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.78)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function clipToDome(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.beginPath();
  ctx.ellipse(width / 2, height / 2, width * DOME_RADIUS_RATIO, height * 0.43, 0, 0, TAU);
  ctx.clip();
}

function drawMilkyWay(ctx: CanvasRenderingContext2D, moment: SkyMoment, width: number, height: number, compact: boolean): void {
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(moment.rotation * 0.42 - 0.62);
  const bandWidth = compact ? height * 0.12 : height * 0.16;
  const bandLength = width * 1.08;
  const gradient = ctx.createLinearGradient(0, -bandWidth, 0, bandWidth);
  gradient.addColorStop(0, "rgba(185, 205, 255, 0)");
  gradient.addColorStop(0.34, compact ? "rgba(185, 205, 255, 0.026)" : "rgba(185, 205, 255, 0.038)");
  gradient.addColorStop(0.5, compact ? "rgba(255, 236, 202, 0.035)" : "rgba(255, 236, 202, 0.065)");
  gradient.addColorStop(0.66, compact ? "rgba(115, 208, 183, 0.024)" : "rgba(115, 208, 183, 0.035)");
  gradient.addColorStop(1, "rgba(185, 205, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.filter = compact ? "blur(10px)" : "blur(16px)";
  ctx.beginPath();
  ctx.ellipse(0, 0, bandLength / 2, bandWidth, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawAtmosphereStars(ctx: CanvasRenderingContext2D, stars: AtmosphereStar[]): void {
  ctx.save();

  for (const star of stars) {
    ctx.beginPath();
    ctx.fillStyle = `hsla(${star.hue}, 70%, 86%, ${star.alpha})`;
    ctx.shadowBlur = star.radius > 1.1 ? star.radius * 2 : 0;
    ctx.shadowColor = `hsla(${star.hue}, 80%, 88%, ${star.alpha * 0.7})`;
    ctx.arc(star.x, star.y, star.radius, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

function drawSkyGrid(ctx: CanvasRenderingContext2D, width: number, height: number, compact: boolean): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = width * DOME_RADIUS_RATIO;
  const radiusY = height * 0.43;

  ctx.save();
  ctx.lineWidth = compact ? 0.5 : 0.8;
  ctx.strokeStyle = compact ? "rgba(180, 215, 255, 0.08)" : "rgba(180, 215, 255, 0.14)";

  for (const scale of [0.25, 0.5, 0.75]) {
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX * scale, radiusY * scale, 0, 0, TAU);
    ctx.stroke();
  }

  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * TAU;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle) * radiusX, centerY + Math.sin(angle) * radiusY);
    ctx.stroke();
  }

  ctx.strokeStyle = compact ? "rgba(255, 235, 192, 0.16)" : "rgba(255, 235, 192, 0.24)";
  ctx.lineWidth = compact ? 0.8 : 1.2;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawCompass(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = width * DOME_RADIUS_RATIO;
  const radiusY = height * 0.43;
  const marks = [
    { label: "N", x: centerX, y: centerY - radiusY - 17 },
    { label: "E", x: centerX + radiusX + 18, y: centerY },
    { label: "S", x: centerX, y: centerY + radiusY + 17 },
    { label: "W", x: centerX - radiusX - 18, y: centerY }
  ];

  ctx.save();
  ctx.font = "700 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(246, 230, 190, 0.72)";

  for (const mark of marks) {
    ctx.fillText(mark.label, mark.x, mark.y);
  }

  ctx.restore();
}

function drawConstellations(
  ctx: CanvasRenderingContext2D,
  catalog: StarCatalog,
  projectedStars: Map<string, ProjectedStar>,
  compact: boolean
): void {
  ctx.save();
  ctx.lineWidth = compact ? 0.65 : 0.9;
  ctx.strokeStyle = compact ? "rgba(176, 204, 255, 0.16)" : "rgba(176, 204, 255, 0.24)";

  for (const constellation of catalog.constellations) {
    ctx.beginPath();
    let hasLine = false;

    for (const [fromId, toId] of constellation.lines) {
      const from = projectedStars.get(fromId);
      const to = projectedStars.get(toId);

      if (!from?.visible || !to?.visible) {
        continue;
      }

      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      hasLine = true;
    }

    if (hasLine) {
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  projectedStars: Map<string, ProjectedStar>,
  compact: boolean
): void {
  ctx.save();

  for (const star of projectedStars.values()) {
    if (!star.visible) {
      continue;
    }

    const radius = starRadius(star.magnitude, compact);
    const alpha = 0.52 + star.magnitude * 0.42;
    const twinkle = 0.78 + Math.sin(star.x * 0.09 + star.y * 0.07) * 0.12;

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = `hsla(${star.hue}, 86%, 72%, ${Math.min(0.28, alpha * 0.2)})`;
    ctx.shadowBlur = compact ? radius * 1.6 : radius * 6;
    ctx.shadowColor = `hsla(${star.hue}, 90%, 78%, 0.56)`;
    ctx.arc(star.x, star.y, radius * (compact ? 1.8 : 2.8), 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.fillStyle = `hsla(${star.hue}, 88%, ${compact ? 82 : 88}%, ${Math.min(1, alpha * twinkle)})`;
    ctx.shadowBlur = compact ? radius * 1.4 : radius * 3.2;
    ctx.shadowColor = `hsla(${star.hue}, 90%, 82%, 0.62)`;
    ctx.arc(star.x, star.y, radius, 0, TAU);
    ctx.fill();

    if (!compact && star.magnitude > 0.78) {
      ctx.save();
      ctx.strokeStyle = `hsla(${star.hue}, 88%, 88%, 0.28)`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(star.x - radius * 3.2, star.y);
      ctx.lineTo(star.x + radius * 3.2, star.y);
      ctx.moveTo(star.x, star.y - radius * 3.2);
      ctx.lineTo(star.x, star.y + radius * 3.2);
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.restore();
}

function drawLabels(
  ctx: CanvasRenderingContext2D,
  projectedStars: Map<string, ProjectedStar>,
  moment: SkyMoment,
  selectedStarId?: string
): void {
  const labelLimit = Math.max(0, Math.round(projectedStars.size * moment.labelDensity));
  const labelCandidates = [...projectedStars.values()]
    .filter((star) => star.visible)
    .sort((a, b) => b.magnitude - a.magnitude)
    .slice(0, labelLimit);

  if (selectedStarId) {
    const selected = projectedStars.get(selectedStarId);
    if (selected?.visible && !labelCandidates.some((star) => star.id === selected.id)) {
      labelCandidates.unshift(selected);
    }
  }

  ctx.save();
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.textBaseline = "middle";

  for (const star of labelCandidates) {
    const offset = 8 + starRadius(star.magnitude, false);
    ctx.fillStyle = "rgba(5, 12, 24, 0.56)";
    ctx.fillText(star.name, star.x + offset + 1, star.y + 1);
    ctx.fillStyle = star.id === selectedStarId ? "rgba(255, 241, 194, 0.96)" : "rgba(230, 238, 255, 0.76)";
    ctx.fillText(star.name, star.x + offset, star.y);
  }

  ctx.restore();
}

function drawSelectedStar(ctx: CanvasRenderingContext2D, star: ProjectedStar, compact: boolean): void {
  const radius = starRadius(star.magnitude, compact) + (compact ? 3 : 5);

  ctx.save();
  ctx.strokeStyle = "rgba(255, 228, 145, 0.95)";
  ctx.lineWidth = compact ? 1.3 : 1.8;
  ctx.shadowBlur = compact ? 6 : 14;
  ctx.shadowColor = "rgba(255, 220, 120, 0.82)";
  ctx.beginPath();
  ctx.arc(star.x, star.y, radius, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(star.x - radius - 4, star.y);
  ctx.lineTo(star.x - radius + 1, star.y);
  ctx.moveTo(star.x + radius - 1, star.y);
  ctx.lineTo(star.x + radius + 4, star.y);
  ctx.moveTo(star.x, star.y - radius - 4);
  ctx.lineTo(star.x, star.y - radius + 1);
  ctx.moveTo(star.x, star.y + radius - 1);
  ctx.lineTo(star.x, star.y + radius + 4);
  ctx.stroke();
  ctx.restore();
}

function starRadius(magnitude: number, compact: boolean): number {
  const base = compact ? 0.85 : 1.15;
  const scale = compact ? 2.15 : 3.1;
  return base + Math.max(0, Math.min(1, magnitude)) * scale;
}

function blendWithAlpha(color: string, alpha: number): string {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const value = hex.length === 3
      ? hex.split("").map((digit) => digit + digit).join("")
      : hex;
    const red = Number.parseInt(value.slice(0, 2), 16);
    const green = Number.parseInt(value.slice(2, 4), 16);
    const blue = Number.parseInt(value.slice(4, 6), 16);

    if ([red, green, blue].every(Number.isFinite)) {
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
  }

  return color;
}

function isInsideDome(x: number, y: number, width: number, height: number): boolean {
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = width * DOME_RADIUS_RATIO;
  const radiusY = height * 0.43;
  const normalizedX = (x - centerX) / radiusX;
  const normalizedY = (y - centerY) / radiusY;

  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

function seededNoise(index: number, seed: number, salt: number): number {
  const value = Math.sin((index + 1) * 127.1 + seed * 31.7 + salt * 17.3) * 43758.5453;
  return value - Math.floor(value);
}

function roundCanvasValue(value: number): number {
  return Math.round(value * 1000) / 1000;
}
