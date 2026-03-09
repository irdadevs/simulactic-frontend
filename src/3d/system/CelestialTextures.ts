import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { PlanetBiome, PlanetType } from "../../types/planet.types";

type RandomFn = () => number;

const textureCache = new Map<string, CanvasTexture>();
const TEXTURE_VERSION = "v2";

const createSeededRandom = (seedInput: string): RandomFn => {
  let seed = 2166136261;
  for (let i = 0; i < seedInput.length; i += 1) {
    seed ^= seedInput.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
};

const parseHex = (hex: string): [number, number, number] => {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((ch) => `${ch}${ch}`).join("") : value;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const parseColor = (value: string): [number, number, number] => {
  if (value.startsWith("rgb(")) {
    const [r, g, b] = value
      .slice(4, -1)
      .split(",")
      .map((part) => Number.parseInt(part.trim(), 10));
    return [r ?? 0, g ?? 0, b ?? 0];
  }
  return parseHex(value);
};

const lerpColor = (a: string, b: string, t: number): string => {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const seededGridNoise = (seed: string, x: number, y: number): number => {
  let hash = 2166136261;
  const value = `${seed}:${x}:${y}`;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff;
};

const valueNoise = (seed: string, x: number, y: number): number => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const sx = x - x0;
  const sy = y - y0;
  const n00 = seededGridNoise(seed, x0, y0);
  const n10 = seededGridNoise(seed, x1, y0);
  const n01 = seededGridNoise(seed, x0, y1);
  const n11 = seededGridNoise(seed, x1, y1);
  const ix0 = n00 + (n10 - n00) * smoothstep(0, 1, sx);
  const ix1 = n01 + (n11 - n01) * smoothstep(0, 1, sx);
  return ix0 + (ix1 - ix0) * smoothstep(0, 1, sy);
};

const fractalNoise = (seed: string, x: number, y: number, octaves: number): number => {
  let amplitude = 1;
  let frequency = 1;
  let total = 0;
  let weight = 0;
  for (let i = 0; i < octaves; i += 1) {
    total += valueNoise(`${seed}:${i}`, x * frequency, y * frequency) * amplitude;
    weight += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return total / Math.max(weight, 1e-6);
};

const pickBiomePalette = (biome: PlanetBiome, variant: number): string[] => {
  const v = variant % 10;
  if (biome === "temperate") return ["#1b4f2f", "#2d7442", "#3f9154", "#5ba670", "#85704f", "#245f9c", "#3d7fbb", "#6ab2da", "#9fd7f2", "#224c30"].slice(v % 3, (v % 3) + 7);
  if (biome === "desert") return ["#a7703d", "#c28846", "#d9a95d", "#e6bf77", "#8b5a2b", "#b67a3c", "#f2d090"];
  if (biome === "ocean") return ["#0d3c78", "#1564a6", "#1f7fc2", "#2fa2db", "#4fc0ea", "#78d4f1", "#2f6f4f"];
  if (biome === "ice") return ["#d9eef7", "#c4e5f5", "#a5d5ed", "#86c4e2", "#6ab0d5", "#e9f7fb", "#8ea4bc"];
  if (biome === "toxic") return ["#5a7b17", "#789c1d", "#9dbd2d", "#c0d83f", "#3f5d11", "#a5b53a", "#4d6a1a"];
  if (biome === "radioactive") return ["#283320", "#3b4a2e", "#55653e", "#6f834f", "#9bc05d", "#263125", "#46553a"];
  return ["#2b2558", "#43367b", "#5e4ea3", "#7d68c8", "#56b6d3", "#79d9e6", "#9befff"];
};

export const biomeBaseColor = (biome: PlanetBiome): string => {
  if (biome === "temperate") return "#3f9154";
  if (biome === "desert") return "#d9a95d";
  if (biome === "ocean") return "#2fa2db";
  if (biome === "ice") return "#b9e7fb";
  if (biome === "toxic") return "#9dbd2d";
  if (biome === "radioactive") return "#7da253";
  return "#7d68c8";
};

const withTextureCache = (key: string, draw: (ctx: CanvasRenderingContext2D, size: number) => void): CanvasTexture => {
  const existing = textureCache.get(key);
  if (existing) return existing;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create texture canvas context.");
  }

  draw(ctx, size);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  textureCache.set(key, texture);
  return texture;
};

export const createPlanetTexture = (input: {
  seed: string;
  biome: PlanetBiome;
  type: PlanetType;
}): CanvasTexture => {
  const variant = Math.abs([...input.seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % 10;
  const key = `planet:${TEXTURE_VERSION}:${input.type}:${input.biome}:${variant}:${input.seed}`;
  return withTextureCache(key, (ctx, size) => {
    const random = createSeededRandom(key);
    const palette = pickBiomePalette(input.biome, variant);
    const primary = palette[0] ?? "#345";
    const secondary = palette[Math.min(2, palette.length - 1)] ?? "#567";
    const accent = palette[Math.min(4, palette.length - 1)] ?? "#789";

    const base = ctx.createLinearGradient(0, 0, size, size);
    base.addColorStop(0, primary);
    base.addColorStop(1, secondary);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    if (input.type === "gas") {
      for (let i = 0; i < 30; i += 1) {
        const t = i / 30;
        const color = lerpColor(primary, accent, (Math.sin(t * Math.PI * 5 + variant) + 1) / 2);
        const y = t * size + (random() * 14 - 7);
        const h = 8 + random() * 20;
        const alpha = 0.34 + random() * 0.24;
        const rgba = color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
        ctx.fillStyle = rgba;
        ctx.fillRect(0, y, size, h);
      }

      for (let i = 0; i < 10; i += 1) {
        const y = random() * size;
        const band = ctx.createLinearGradient(0, y, size, y + 18);
        band.addColorStop(0, "rgba(255,255,255,0)");
        band.addColorStop(0.5, `rgba(255,255,255,${0.08 + random() * 0.12})`);
        band.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = band;
        ctx.fillRect(0, y, size, 18 + random() * 28);
      }

      const stormX = size * (0.2 + random() * 0.6);
      const stormY = size * (0.2 + random() * 0.6);
      const storm = ctx.createRadialGradient(stormX, stormY, 8, stormX, stormY, 56);
      storm.addColorStop(0, "rgba(255, 255, 255, 0.5)");
      storm.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = storm;
      ctx.beginPath();
      ctx.arc(stormX, stormY, 64, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const image = ctx.createImageData(size, size);
    const data = image.data;
    const seedA = `${key}:terrain`;
    const seedB = `${key}:moisture`;
    const seedC = `${key}:detail`;

    const waterRatio =
      input.biome === "temperate"
        ? 0.54
        : input.biome === "ocean"
          ? 0.72
          : input.biome === "desert"
            ? 0.18
            : input.biome === "radioactive"
              ? 0.14
              : input.biome === "ice"
                ? 0.58
                : 0.08;

    const waterThreshold = 1 - waterRatio;

    const waterDeep =
      input.biome === "temperate"
        ? "#245f9c"
        : input.biome === "ocean"
          ? "#1564a6"
          : input.biome === "desert"
            ? "#346b9a"
            : input.biome === "radioactive"
              ? "#3d6b5e"
              : "#6ab0d5";
    const waterShallow =
      input.biome === "temperate"
        ? "#6ab2da"
        : input.biome === "ocean"
          ? "#4fc0ea"
          : input.biome === "desert"
            ? "#78b7d8"
            : input.biome === "radioactive"
              ? "#79a88d"
              : "#d9eef7";

    const landLow = primary;
    const landMid = secondary;
    const landHigh = accent;

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const nx = x / size;
        const ny = y / size;
        const elevation =
          fractalNoise(seedA, nx * 5.2, ny * 5.2, 5) * 0.72 +
          fractalNoise(seedC, nx * 13.4, ny * 13.4, 3) * 0.28;
        const moisture = fractalNoise(seedB, nx * 4.4, ny * 4.4, 4);
        const idx = (y * size + x) * 4;

        let color = landMid;
        if (elevation < waterThreshold) {
          const depthT = smoothstep(0, waterThreshold, elevation);
          color = depthT > 0.7 ? waterShallow : lerpColor(waterDeep, waterShallow, depthT);
        } else {
          const landT = smoothstep(waterThreshold, 1, elevation);
          if (input.biome === "temperate") {
            color =
              moisture > 0.58
                ? lerpColor("#2d7442", "#5ba670", landT)
                : moisture < 0.28
                  ? lerpColor("#85704f", "#5e8b4a", landT)
                  : lerpColor(landLow, landHigh, landT);
          } else if (input.biome === "desert") {
            color =
              moisture > 0.5
                ? lerpColor("#8f8d54", "#b89c63", landT)
                : lerpColor("#8b5a2b", "#f2d090", landT);
          } else if (input.biome === "ocean") {
            color =
              moisture > 0.45
                ? lerpColor("#2f6f4f", "#78a86e", landT)
                : lerpColor("#49664d", "#8a9b72", landT);
          } else if (input.biome === "radioactive") {
            color =
              moisture > 0.35
                ? lerpColor("#55653e", "#9bc05d", landT)
                : lerpColor("#3b4a2e", "#6f834f", landT);
          } else {
            color = lerpColor(landLow, landHigh, landT);
          }
        }

        const [r, g, b] = parseColor(color);
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);

    for (let i = 0; i < 16; i += 1) {
      const cx = random() * size;
      const cy = random() * size;
      const cloud = ctx.createRadialGradient(cx, cy, 2, cx, cy, 20 + random() * 36);
      cloud.addColorStop(0, "rgba(245, 250, 255, 0.3)");
      cloud.addColorStop(1, "rgba(245, 250, 255, 0)");
      ctx.fillStyle = cloud;
      ctx.beginPath();
      ctx.arc(cx, cy, 26 + random() * 32, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};

export const createMoonTexture = (seed: string): CanvasTexture =>
  withTextureCache(`moon:${TEXTURE_VERSION}:${seed}`, (ctx, size) => {
    const random = createSeededRandom(seed);
    const bg = ctx.createLinearGradient(0, 0, size, size);
    bg.addColorStop(0, "#c2ccd1");
    bg.addColorStop(0.45, "#8f9ba3");
    bg.addColorStop(1, "#46525c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 44; i += 1) {
      const x = random() * size;
      const y = random() * size;
      const radius = 7 + random() * 46;
      const shade = 35 + Math.floor(random() * 120);
      ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${0.44 + random() * 0.22})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      const rim = Math.max(1, radius * 0.08);
      ctx.strokeStyle = `rgba(240, 245, 250, ${0.18 + random() * 0.28})`;
      ctx.lineWidth = rim;
      ctx.stroke();
    }

    for (let i = 0; i < 10; i += 1) {
      const x = random() * size;
      const y = random() * size;
      const highlight = ctx.createRadialGradient(x, y, 4, x, y, 32 + random() * 34);
      highlight.addColorStop(0, "rgba(255,255,255,0.24)");
      highlight.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = highlight;
      ctx.beginPath();
      ctx.arc(x, y, 30 + random() * 32, 0, Math.PI * 2);
      ctx.fill();
    }
  });

export const createAsteroidTexture = (seed: string): CanvasTexture =>
  withTextureCache(`asteroid:${TEXTURE_VERSION}:${seed}`, (ctx, size) => {
    const random = createSeededRandom(seed);
    const base = ctx.createLinearGradient(0, 0, size, size);
    base.addColorStop(0, "#9c8b74");
    base.addColorStop(0.55, "#7d6753");
    base.addColorStop(1, "#5a4637");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 40; i += 1) {
      const red = 92 + Math.floor(random() * 70);
      const green = 76 + Math.floor(random() * 48);
      const blue = 58 + Math.floor(random() * 34);
      const alpha = 0.12 + random() * 0.24;
      ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      const x = random() * size;
      const y = random() * size;
      const r = 6 + random() * 26;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 8; i += 1) {
      const metallic = random() > 0.58;
      const tint = metallic
        ? lerpColor("#d29b56", "#8d7860", random())
        : lerpColor("#6e4c33", "#a97d56", random());
      const [r, g, b] = parseHex(tint);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${metallic ? 0.34 : 0.22})`;
      const x = random() * size;
      const y = random() * size;
      const w = 12 + random() * 36;
      const h = 4 + random() * 16;
      ctx.fillRect(x, y, w, h);
    }

    for (let i = 0; i < 10; i += 1) {
      const x = random() * size;
      const y = random() * size;
      const glow = ctx.createRadialGradient(x, y, 1, x, y, 10 + random() * 10);
      glow.addColorStop(0, "rgba(255,226,180,0.32)");
      glow.addColorStop(1, "rgba(255,226,180,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 8 + random() * 10, 0, Math.PI * 2);
      ctx.fill();
    }
  });

export const createStarTexture = (seed: string, coreColor: string): CanvasTexture =>
  withTextureCache(`star:${TEXTURE_VERSION}:${seed}:${coreColor}`, (ctx, size) => {
    const random = createSeededRandom(`${seed}:${coreColor}`);
    const [r, g, b] = parseHex(coreColor);
    const bg = ctx.createRadialGradient(size / 2, size / 2, 12, size / 2, size / 2, size / 2);
    bg.addColorStop(0, `rgba(${Math.min(255, r + 70)}, ${Math.min(255, g + 70)}, ${Math.min(255, b + 70)}, 1)`);
    bg.addColorStop(0.18, `rgba(${Math.min(255, r + 35)}, ${Math.min(255, g + 35)}, ${Math.min(255, b + 35)}, 0.98)`);
    bg.addColorStop(1, `rgba(${Math.max(0, r - 45)}, ${Math.max(0, g - 45)}, ${Math.max(0, b - 45)}, 1)`);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 36; i += 1) {
      const rr = Math.max(0, Math.min(255, r + Math.round((random() * 2 - 1) * 50)));
      const gg = Math.max(0, Math.min(255, g + Math.round((random() * 2 - 1) * 50)));
      const bb = Math.max(0, Math.min(255, b + Math.round((random() * 2 - 1) * 50)));
      const alpha = 0.12 + random() * 0.24;
      ctx.fillStyle = `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(random() * size, random() * size, 14 + random() * 58, 8 + random() * 26, random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    const flare = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.34);
    flare.addColorStop(0, "rgba(255,255,255,0.92)");
    flare.addColorStop(0.2, "rgba(255,255,255,0.5)");
    flare.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = flare;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.34, 0, Math.PI * 2);
    ctx.fill();
  });
