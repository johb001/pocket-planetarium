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

interface DrawSkyOptions extends RenderSkyOptions {
  compact: boolean;
}

const TAU = Math.PI * 2;
const SKY_PADDING_RATIO = 0.08;

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
  clipToDome(ctx, width, height);

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
  glow.addColorStop(0, blendWithAlpha(moment.colors.glow, 0.42));
  glow.addColorStop(0.5, blendWithAlpha(moment.colors.glow, 0.14));
  glow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

function clipToDome(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.beginPath();
  ctx.ellipse(width / 2, height / 2, width * 0.48, height * 0.44, 0, 0, TAU);
  ctx.clip();
}

function drawConstellations(
  ctx: CanvasRenderingContext2D,
  catalog: StarCatalog,
  projectedStars: Map<string, ProjectedStar>,
  compact: boolean
): void {
  ctx.save();
  ctx.lineWidth = compact ? 0.75 : 1.1;
  ctx.strokeStyle = compact ? "rgba(189, 213, 255, 0.18)" : "rgba(189, 213, 255, 0.28)";

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

    ctx.beginPath();
    ctx.fillStyle = `hsla(${star.hue}, 86%, ${compact ? 78 : 84}%, ${alpha * twinkle})`;
    ctx.shadowBlur = compact ? radius * 1.2 : radius * 2.4;
    ctx.shadowColor = `hsla(${star.hue}, 90%, 82%, 0.62)`;
    ctx.arc(star.x, star.y, radius, 0, TAU);
    ctx.fill();
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
