import {
  AdditiveBlending,
  CanvasTexture,
  ConeGeometry,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RingGeometry,
  SphereGeometry,
} from "three";
import { StarType } from "../../types/star.types";
import { colorByStarType } from "../../lib/visual/starColorPalette";
import { createStarTexture } from "./CelestialTextures";

const pickColor = (starType: StarType, fallback?: string): string => {
  return colorByStarType(starType, fallback);
};

const glowTextureCache = new Map<string, CanvasTexture>();

const createOuterGlowTexture = (color: string): CanvasTexture => {
  const cached = glowTextureCache.get(color);
  if (cached) return cached;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create glow texture context.");
  }

  const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  gradient.addColorStop(0.14, "rgba(255, 255, 255, 0.72)");
  gradient.addColorStop(0.34, color);
  gradient.addColorStop(0.68, "rgba(255, 255, 255, 0.06)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  glowTextureCache.set(color, texture);
  return texture;
};

const jetTextureCache = new Map<string, CanvasTexture>();
const diskTextureCache = new Map<string, CanvasTexture>();

const createJetTexture = (coreColor: string): CanvasTexture => {
  const cached = jetTextureCache.get(coreColor);
  if (cached) return cached;

  const width = 96;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create jet texture context.");
  }

  const horizontal = ctx.createLinearGradient(0, 0, width, 0);
  horizontal.addColorStop(0, "rgba(0,0,0,0)");
  horizontal.addColorStop(0.25, "rgba(255,255,255,0.55)");
  horizontal.addColorStop(0.5, coreColor);
  horizontal.addColorStop(0.75, "rgba(255,255,255,0.55)");
  horizontal.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = horizontal;
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = "destination-in";
  const vertical = ctx.createLinearGradient(0, 0, 0, height);
  vertical.addColorStop(0, "rgba(255,255,255,0.98)");
  vertical.addColorStop(0.2, "rgba(255,255,255,0.92)");
  vertical.addColorStop(0.58, "rgba(255,255,255,0.42)");
  vertical.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = vertical;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  jetTextureCache.set(coreColor, texture);
  return texture;
};

const createDiskTexture = (colorA: string, colorB: string): CanvasTexture => {
  const key = `${colorA}:${colorB}`;
  const cached = diskTextureCache.get(key);
  if (cached) return cached;

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create disk texture context.");
  }

  const center = size / 2;
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, `${colorA}00`);
  gradient.addColorStop(0.24, `${colorA}cc`);
  gradient.addColorStop(0.52, `${colorB}f2`);
  gradient.addColorStop(0.8, `${colorA}aa`);
  gradient.addColorStop(1, `${colorA}00`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.globalCompositeOperation = "destination-in";
  const mask = ctx.createRadialGradient(center, center, size * 0.18, center, center, size * 0.48);
  mask.addColorStop(0, "rgba(0,0,0,0)");
  mask.addColorStop(0.28, "rgba(255,255,255,0.88)");
  mask.addColorStop(0.65, "rgba(255,255,255,0.8)");
  mask.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "source-over";

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  diskTextureCache.set(key, texture);
  return texture;
};

const addNeutronJets = (target: Group, size: number, seed: string): void => {
  const jetLength = size * 7.4;
  const jetRadius = Math.max(0.14, size * 0.34);
  const geometry = new ConeGeometry(jetRadius, jetLength, 18, 1, true);
  const texture = createJetTexture("#9ed8ff");
  const material = new MeshBasicMaterial({
    color: "#bfe8ff",
    map: texture,
    transparent: true,
    opacity: 0.9,
    blending: AdditiveBlending,
    side: DoubleSide,
    depthWrite: false,
  });

  const first = new Mesh(geometry, material);
  const second = new Mesh(geometry.clone(), material.clone());
  const innerFirst = new Mesh(
    new ConeGeometry(jetRadius * 0.48, jetLength * 0.78, 16, 1, true),
    new MeshBasicMaterial({
      color: "#ffffff",
      map: createJetTexture("#ffffff"),
      transparent: true,
      opacity: 0.55,
      blending: AdditiveBlending,
      side: DoubleSide,
      depthWrite: false,
    }),
  );
  const innerSecond = innerFirst.clone();
  const haloFirst = new Mesh(
    new ConeGeometry(jetRadius * 0.86, jetLength * 0.96, 16, 1, true),
    new MeshBasicMaterial({
      color: "#7fd0ff",
      map: createJetTexture("#7fd0ff"),
      transparent: true,
      opacity: 0.32,
      blending: AdditiveBlending,
      side: DoubleSide,
      depthWrite: false,
    }),
  );
  const haloSecond = haloFirst.clone();

  const horizontal = seed.length % 2 === 0;
  if (horizontal) {
    first.rotation.z = -Math.PI / 2;
    second.rotation.z = Math.PI / 2;
    innerFirst.rotation.z = -Math.PI / 2;
    innerSecond.rotation.z = Math.PI / 2;
    first.position.x = jetLength * 0.52;
    second.position.x = -jetLength * 0.52;
    innerFirst.position.x = jetLength * 0.4;
    innerSecond.position.x = -jetLength * 0.4;
    haloFirst.rotation.z = -Math.PI / 2;
    haloSecond.rotation.z = Math.PI / 2;
    haloFirst.position.x = jetLength * 0.48;
    haloSecond.position.x = -jetLength * 0.48;
  } else {
    first.rotation.x = Math.PI;
    second.rotation.x = 0;
    innerFirst.rotation.x = Math.PI;
    innerSecond.rotation.x = 0;
    first.position.y = jetLength * 0.52;
    second.position.y = -jetLength * 0.52;
    innerFirst.position.y = jetLength * 0.4;
    innerSecond.position.y = -jetLength * 0.4;
    haloFirst.rotation.x = Math.PI;
    haloSecond.rotation.x = 0;
    haloFirst.position.y = jetLength * 0.48;
    haloSecond.position.y = -jetLength * 0.48;
  }

  target.add(first);
  target.add(second);
  target.add(innerFirst);
  target.add(innerSecond);
  target.add(haloFirst);
  target.add(haloSecond);
};

const addAccretionDisk = (target: Group, size: number): void => {
  const layers = [
    { inner: 1.24, outer: 1.76, opacity: 0.42, tilt: Math.PI / 2, texture: createDiskTexture("#ffd86b", "#ff9b2f") },
    { inner: 1.62, outer: 2.28, opacity: 0.34, tilt: Math.PI / 2 + 0.18, texture: createDiskTexture("#ffbf4c", "#ff7d1f") },
    { inner: 2.06, outer: 2.9, opacity: 0.22, tilt: Math.PI / 2 - 0.14, texture: createDiskTexture("#ffefb0", "#ff9a3d") },
  ];

  layers.forEach((layer) => {
    const disk = new Mesh(
      new RingGeometry(size * layer.inner, size * layer.outer, 72),
      new MeshBasicMaterial({
        color: new Color("#ffffff"),
        map: layer.texture,
        transparent: true,
        opacity: layer.opacity,
        blending: AdditiveBlending,
        side: DoubleSide,
        depthWrite: false,
      }),
    );
    disk.rotation.x = layer.tilt;
    target.add(disk);
  });
};

export class StarVisualFactory {
  static create(input: {
    starId: string;
    starType: StarType;
    size: number;
    color?: string;
    isMain: boolean;
  }): Group {
    const root = new Group();
    const tone = pickColor(input.starType, input.color);
    const radius = Math.max(input.size, 0.6);

    if (input.starType === "Black hole") {
      const singularity = new Mesh(
        new SphereGeometry(radius * 0.92, 22, 22),
        new MeshStandardMaterial({
          color: "#0a0a0a",
          roughness: 0.1,
          metalness: 0.8,
          emissive: "#000000",
          emissiveIntensity: 0,
        }),
      );
      root.add(singularity);
      addAccretionDisk(root, radius);
      return root;
    }

    const starTexture = createStarTexture(input.starId, tone);
    const core = new Mesh(
      new SphereGeometry(radius, 26, 26),
      new MeshStandardMaterial({
        color: tone,
        map: starTexture,
        emissive: tone,
        emissiveMap: starTexture,
        emissiveIntensity: input.isMain ? 1.9 : 1.35,
        roughness: 0.26,
        metalness: 0.04,
      }),
    );
    root.add(core);

    root.add(
      new Mesh(
        new SphereGeometry(radius * (input.isMain ? 2.95 : 2.2), 18, 18),
        new MeshBasicMaterial({
          color: "#ffffff",
          map: createOuterGlowTexture(tone),
          transparent: true,
          opacity: input.isMain ? 0.34 : 0.2,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );

    if (input.starType === "Neutron star") {
      addNeutronJets(root, radius, input.starId);
    }

    return root;
  }
}
