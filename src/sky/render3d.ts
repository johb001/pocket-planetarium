import * as THREE from "three";
import type { SkyMoment, Star, StarCatalog } from "../types";

export interface DomeVector {
  x: number;
  y: number;
  z: number;
}

export interface DomeProjection {
  id: string;
  visible: boolean;
  position: DomeVector;
  scale: number;
  hue: number;
  magnitude: number;
}

export interface DomeAtmosphereStar {
  position: DomeVector;
  scale: number;
  alpha: number;
  hue: number;
}

export interface SkyDomeRenderOptions {
  catalog: StarCatalog;
  moment: SkyMoment;
  selectedStarId?: string;
  showConstellations?: boolean;
  showLabels?: boolean;
}

export interface SkyDomeRenderer {
  resize(width: number, height: number): void;
  render(options: SkyDomeRenderOptions): void;
  dispose(): void;
}

const DOME_RADIUS = 12;
const BACKGROUND_STAR_COUNT = 700;
const TAU = Math.PI * 2;
const MIN_CAMERA_DISTANCE = 10;
const MAX_CAMERA_DISTANCE = 30;

export function projectStarToDome(star: Star, radius = DOME_RADIUS): DomeProjection {
  if (star.visible === false) {
    return {
      id: star.id,
      visible: false,
      position: { x: 0, y: 0, z: 0 },
      scale: 0,
      hue: star.hue,
      magnitude: star.magnitude
    };
  }

  const normalizedX = clamp((star.x - 50) / 50, -1, 1);
  const normalizedY = clamp((star.y - 50) / 50, -1, 1);
  const distance = Math.min(1, Math.hypot(normalizedX, normalizedY));
  const angle = Math.atan2(normalizedY, normalizedX);
  const domeDistance = Math.sin((distance * Math.PI) / 2);
  const depth = -6 - Math.cos((distance * Math.PI) / 2) * radius * 0.86;

  return {
    id: star.id,
    visible: distance <= 1,
    position: {
      x: round(Math.cos(angle) * domeDistance * radius),
      y: round(-Math.sin(angle) * domeDistance * radius * 0.78),
      z: round(depth)
    },
    scale: round(0.035 + Math.max(0, Math.min(1, star.magnitude)) * 0.14),
    hue: star.hue,
    magnitude: star.magnitude
  };
}

export function createDomeAtmosphereStars(count = BACKGROUND_STAR_COUNT, rotation = 0): DomeAtmosphereStar[] {
  const stars: DomeAtmosphereStar[] = [];
  const seed = Math.round(rotation * 1000);

  for (let index = 0; stars.length < count && index < count * 8; index += 1) {
    const azimuth = seededNoise(index, seed, 17) * TAU;
    const elevation = Math.acos(1 - seededNoise(index, seed, 29) * 0.92);
    const radius = DOME_RADIUS + 4 + seededNoise(index, seed, 41) * 10;
    const x = Math.cos(azimuth) * Math.sin(elevation) * radius;
    const y = Math.sin(azimuth) * Math.sin(elevation) * radius * 0.82;
    const z = -2.2 - Math.cos(elevation) * radius;

    stars.push({
      position: {
        x: round(x),
        y: round(y),
        z: round(z)
      },
      scale: round(0.018 + seededNoise(index, seed, 53) * 0.055),
      alpha: round(0.18 + seededNoise(index, seed, 61) * 0.48),
      hue: Math.round(198 + seededNoise(index, seed, 71) * 52)
    });
  }

  return stars;
}

export function applyZoomDistance(currentDistance: number, wheelDeltaY: number): number {
  return round(clamp(currentDistance + wheelDeltaY * 0.012, MIN_CAMERA_DISTANCE, MAX_CAMERA_DISTANCE));
}

export function guideLineOpacity(visible: boolean): number {
  return visible ? 0.075 : 0;
}

export function createSkyDomeRenderer(canvas: HTMLCanvasElement): SkyDomeRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setClearColor(0x02040a, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030713, 0.032);

  const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 100);
  let cameraDistance = 18;
  camera.position.set(0, 0, cameraDistance);
  camera.lookAt(0, 0, -6);

  const root = new THREE.Group();
  root.rotation.x = -0.08;
  scene.add(root);

  const starGroup = new THREE.Group();
  const lineGroup = new THREE.Group();
  const gridGroup = createGridGroup();
  const atmosphere = createAtmospherePoints();
  const glow = createDomeGlow();
  root.add(glow, atmosphere, gridGroup, lineGroup, starGroup);
  const starTexture = createStarTexture();

  const ambient = new THREE.AmbientLight(0x9fb7ff, 0.75);
  const key = new THREE.PointLight(0xbfd7ff, 1.8, 55);
  key.position.set(-5, 7, 8);
  scene.add(ambient, key);

  let manualRotationX = -0.08;
  let manualRotationY = 0;
  let dragStart: { x: number; y: number; rotationX: number; rotationY: number } | undefined;
  let latestOptions: SkyDomeRenderOptions | undefined;
  let animationFrame = 0;

  const onPointerDown = (event: PointerEvent) => {
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("is-dragging");
    dragStart = {
      x: event.clientX,
      y: event.clientY,
      rotationX: root.rotation.x,
      rotationY: root.rotation.y
    };
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!dragStart) {
      return;
    }

    manualRotationY = dragStart.rotationY + (event.clientX - dragStart.x) * 0.003;
    manualRotationX = clamp(dragStart.rotationX + (event.clientY - dragStart.y) * 0.002, -0.32, 0.18);
  };
  const onPointerUp = (event: PointerEvent) => {
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    canvas.classList.remove("is-dragging");
    dragStart = undefined;
  };
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    cameraDistance = applyZoomDistance(cameraDistance, event.deltaY);
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  const tick = () => {
    const time = performance.now();
    root.rotation.y = manualRotationY + Math.sin(time * 0.00012) * 0.075;
    root.rotation.x = manualRotationX + Math.sin(time * 0.00009) * 0.02;
    camera.position.z += (cameraDistance - camera.position.z) * 0.16;

    if (latestOptions) {
      renderer.render(scene, camera);
    }

    animationFrame = requestAnimationFrame(tick);
  };
  animationFrame = requestAnimationFrame(tick);

  return {
    resize(width: number, height: number) {
      const safeWidth = Math.max(1, width);
      const safeHeight = Math.max(1, height);
      renderer.setSize(safeWidth, safeHeight, false);
      camera.aspect = safeWidth / safeHeight;
      camera.updateProjectionMatrix();
    },
    render(options: SkyDomeRenderOptions) {
      latestOptions = options;
      atmosphere.rotation.z = options.moment.rotation * 0.003;
      updateStars(starGroup, options.catalog.stars, options.selectedStarId, starTexture);
      const guidesVisible = options.showConstellations ?? false;
      setGridOpacity(gridGroup, guideLineOpacity(guidesVisible));
      updateConstellationLines(lineGroup, options.catalog, guidesVisible);
      updateSceneColors(scene, glow, options.moment);
      renderer.render(scene, camera);
    },
    dispose() {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(animationFrame);
      disposeObject(root);
      starTexture.dispose();
      renderer.dispose();
    }
  };
}

function createAtmospherePoints(): THREE.Points {
  const stars = createDomeAtmosphereStars();
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(stars.length * 3);
  const colors = new Float32Array(stars.length * 3);
  const color = new THREE.Color();

  stars.forEach((star, index) => {
    positions[index * 3] = star.position.x;
    positions[index * 3 + 1] = star.position.y;
    positions[index * 3 + 2] = star.position.z;
    color.setHSL(star.hue / 360, 0.64, 0.82);
    const brightness = 0.45 + star.alpha * 0.75;
    colors[index * 3] = color.r * brightness;
    colors[index * 3 + 1] = color.g * brightness;
    colors[index * 3 + 2] = color.b * brightness;
  });

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.09,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
}

function createGridGroup(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0x86a7d7,
    transparent: true,
    opacity: guideLineOpacity(false),
    depthWrite: false
  });

  for (const scale of [0.32, 0.56, 0.8, 1]) {
    group.add(createEllipseLine(DOME_RADIUS * scale, DOME_RADIUS * 0.78 * scale, -DOME_RADIUS * 0.32, material));
  }

  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * TAU;
    const points = [
      new THREE.Vector3(0, 0, -DOME_RADIUS),
      new THREE.Vector3(Math.cos(angle) * DOME_RADIUS, Math.sin(angle) * DOME_RADIUS * 0.78, -DOME_RADIUS * 0.32)
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }

  return group;
}

function setGridOpacity(group: THREE.Group, opacity: number): void {
  group.traverse((child) => {
    const line = child as THREE.Line;
    const material = "material" in line ? line.material : undefined;
    if (material instanceof THREE.LineBasicMaterial) {
      material.opacity = opacity;
      material.visible = opacity > 0;
    }
  });
}

function createEllipseLine(radiusX: number, radiusY: number, z: number, material: THREE.LineBasicMaterial): THREE.Line {
  const points: THREE.Vector3[] = [];

  for (let index = 0; index <= 96; index += 1) {
    const angle = (index / 96) * TAU;
    points.push(new THREE.Vector3(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, z));
  }

  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
}

function createDomeGlow(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(DOME_RADIUS * 1.18, 48, 24, 0, TAU, 0, Math.PI / 2);
  geometry.scale(1, 0.74, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0x16244a,
    transparent: true,
    opacity: 0.055,
    side: THREE.BackSide,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI;
  mesh.position.z = -DOME_RADIUS * 0.38;
  return mesh;
}

function createStarTexture(): THREE.CanvasTexture {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 96;
  textureCanvas.height = 96;
  const context = textureCanvas.getContext("2d");

  if (context) {
    const gradient = context.createRadialGradient(48, 48, 0, 48, 48, 46);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.18, "rgba(255,255,255,0.92)");
    gradient.addColorStop(0.48, "rgba(255,255,255,0.26)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 96, 96);
  }

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function updateStars(
  group: THREE.Group,
  stars: Star[],
  selectedStarId: string | undefined,
  starTexture: THREE.Texture
): void {
  clearGroup(group);

  for (const star of stars) {
    const projected = projectStarToDome(star);
    if (!projected.visible) {
      continue;
    }

    const color = new THREE.Color().setHSL(star.hue / 360, 0.82, star.id === selectedStarId ? 0.78 : 0.68);
    const material = new THREE.SpriteMaterial({
      map: starTexture,
      color,
      transparent: true,
      opacity: star.id === selectedStarId ? 1 : 0.96,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(projected.position.x, projected.position.y, projected.position.z);
    const depthScale = 0.62 + Math.min(1, Math.abs(projected.position.z) / (DOME_RADIUS + 6)) * 0.52;
    const scale = projected.scale * depthScale * (star.id === selectedStarId ? 3.2 : 2.35);
    sprite.scale.set(scale, scale, scale);
    group.add(sprite);

    if (star.magnitude > 0.78 || star.id === selectedStarId) {
      const haloMaterial = new THREE.SpriteMaterial({
        map: starTexture,
        color,
        transparent: true,
        opacity: star.id === selectedStarId ? 0.44 : 0.28,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const halo = new THREE.Sprite(haloMaterial);
      halo.position.copy(sprite.position);
      halo.scale.set(scale * 3.8, scale * 3.8, scale * 3.8);
      group.add(halo);
    }
  }
}

function updateConstellationLines(group: THREE.Group, catalog: StarCatalog, visible: boolean): void {
  clearGroup(group);
  if (!visible) {
    return;
  }

  const projected = new Map(catalog.stars.map((star) => [star.id, projectStarToDome(star)]));
  const material = new THREE.LineBasicMaterial({
    color: 0x8db7ff,
    transparent: true,
    opacity: 0.12,
    depthWrite: false
  });

  for (const constellation of catalog.constellations) {
    for (const [fromId, toId] of constellation.lines) {
      const from = projected.get(fromId);
      const to = projected.get(toId);
      if (!from?.visible || !to?.visible) {
        continue;
      }

      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(from.position.x, from.position.y, from.position.z),
          new THREE.Vector3(to.position.x, to.position.y, to.position.z)
        ]),
        material.clone()
      ));
    }
  }
}

function updateSceneColors(scene: THREE.Scene, glow: THREE.Mesh, moment: SkyMoment): void {
  const color = new THREE.Color(moment.colors.zenith);
  scene.background = color;

  const material = glow.material;
  if (material instanceof THREE.MeshBasicMaterial) {
    material.color.set(moment.colors.glow);
    material.opacity = 0.16 + (1 - Math.abs(moment.value - 0.5) * 2) * 0.06;
  }
}

function clearGroup(group: THREE.Group): void {
  for (const child of [...group.children]) {
    group.remove(child);
    disposeObject(child);
  }
}

function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh | THREE.Line | THREE.Points | THREE.Sprite;
    const geometry = "geometry" in mesh ? mesh.geometry : undefined;
    const material = "material" in mesh ? mesh.material : undefined;

    geometry?.dispose();
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material?.dispose();
    }
  });
}

function seededNoise(index: number, seed: number, salt: number): number {
  const value = Math.sin((index + 1) * 127.1 + seed * 31.7 + salt * 17.3) * 43758.5453;
  return value - Math.floor(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
