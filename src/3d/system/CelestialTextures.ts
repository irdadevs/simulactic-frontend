import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { PlanetBiome, PlanetType } from "../../types/planet.types";

type RandomFn = () => number;

const textureCache = new Map<string, CanvasTexture>();
const TEXTURE_VERSION = "v4";

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

const offsetColor = (color: string, dr: number, dg: number, db: number): string => {
  const [r, g, b] = parseColor(color);
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  return `rgb(${clamp(r + dr)}, ${clamp(g + dg)}, ${clamp(b + db)})`;
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

type BiomeProfile = {
  palette: string[];
  waterRatio: number;
  waterDeep: string;
  waterShallow: string;
  wetLow: string;
  wetHigh: string;
  dryLow: string;
  dryHigh: string;
  peakLow: string;
  peakHigh: string;
  cloudiness: number;
  overlay?:
    | "lush"
    | "wetlands"
    | "dunes"
    | "volcanic"
    | "lava"
    | "toxic"
    | "radioactive"
    | "sulfuric"
    | "crystal"
    | "barren"
    | "glacial"
    | "frozen-ocean"
    | "ice-canyon"
    | "cryo-volcanic"
    | "polar-desert"
    | "frost-crystal";
};

const rotatePalette = (palette: string[], variant: number): string[] => {
  const offset = variant % palette.length;
  return palette.slice(offset).concat(palette.slice(0, offset));
};

const BIOME_PROFILES: Record<PlanetBiome, BiomeProfile> = {
  none: {
    palette: ["#d9b66e", "#bf8f43", "#8d6531", "#6f8fb4"],
    waterRatio: 0,
    waterDeep: "#1f3554",
    waterShallow: "#4776a8",
    wetLow: "#8a6c43",
    wetHigh: "#cfb07d",
    dryLow: "#6d5332",
    dryHigh: "#b88f56",
    peakLow: "#cab489",
    peakHigh: "#f0dfb6",
    cloudiness: 0,
  },
  gaia: {
    palette: ["#17492a", "#21643a", "#2d8348", "#58aa67", "#8bc27b", "#2a7094", "#6cbfe2"],
    waterRatio: 0.56,
    waterDeep: "#174f82",
    waterShallow: "#6bc8ee",
    wetLow: "#215f36",
    wetHigh: "#6eb878",
    dryLow: "#62784d",
    dryHigh: "#9cc36d",
    peakLow: "#738d63",
    peakHigh: "#d9ead2",
    cloudiness: 0.22,
    overlay: "lush",
  },
  temperate: {
    palette: ["#1b4f2f", "#2d7442", "#3f9154", "#5ba670", "#85704f", "#245f9c", "#6ab2da"],
    waterRatio: 0.48,
    waterDeep: "#245f9c",
    waterShallow: "#6ab2da",
    wetLow: "#2d7442",
    wetHigh: "#63aa6d",
    dryLow: "#756246",
    dryHigh: "#96a46a",
    peakLow: "#6a7857",
    peakHigh: "#d3d9c9",
    cloudiness: 0.16,
  },
  continental: {
    palette: ["#285636", "#39774a", "#5f9b62", "#88b477", "#9d8156", "#2c689b", "#79bfdb"],
    waterRatio: 0.41,
    waterDeep: "#1f5a8d",
    waterShallow: "#74bedb",
    wetLow: "#346f43",
    wetHigh: "#79b874",
    dryLow: "#7e6a49",
    dryHigh: "#a1b170",
    peakLow: "#78805f",
    peakHigh: "#dbddd3",
    cloudiness: 0.15,
  },
  ocean: {
    palette: ["#0d3c78", "#1564a6", "#1f7fc2", "#2fa2db", "#4fc0ea", "#78d4f1", "#2f6f4f"],
    waterRatio: 0.8,
    waterDeep: "#0f3f73",
    waterShallow: "#67cdf1",
    wetLow: "#2f7050",
    wetHigh: "#79b98a",
    dryLow: "#56715b",
    dryHigh: "#8ca887",
    peakLow: "#92a7a2",
    peakHigh: "#e3ecec",
    cloudiness: 0.2,
    overlay: "lush",
  },
  archipelago: {
    palette: ["#1194b8", "#4ac9de", "#8fe6e3", "#edd89a", "#57a44f", "#2c7542", "#ebc779"],
    waterRatio: 0.74,
    waterDeep: "#1481ad",
    waterShallow: "#87e4ef",
    wetLow: "#2f7b42",
    wetHigh: "#69bf62",
    dryLow: "#cba45b",
    dryHigh: "#f0dd9a",
    peakLow: "#6b905f",
    peakHigh: "#dfecc7",
    cloudiness: 0.21,
    overlay: "lush",
  },
  forest: {
    palette: ["#163822", "#235234", "#2f6940", "#427f50", "#6da36f", "#73835d", "#9db08a"],
    waterRatio: 0.33,
    waterDeep: "#275983",
    waterShallow: "#76bed8",
    wetLow: "#204e30",
    wetHigh: "#5a9962",
    dryLow: "#65724a",
    dryHigh: "#8da26c",
    peakLow: "#5b6651",
    peakHigh: "#c7d0bf",
    cloudiness: 0.16,
    overlay: "lush",
  },
  jungle: {
    palette: ["#0f381e", "#155128", "#1e6d35", "#37914d", "#5bb765", "#3f6f29", "#9cca71"],
    waterRatio: 0.38,
    waterDeep: "#21597e",
    waterShallow: "#65c0c9",
    wetLow: "#14502a",
    wetHigh: "#53b860",
    dryLow: "#62703a",
    dryHigh: "#8cab57",
    peakLow: "#4f6244",
    peakHigh: "#bfd7b4",
    cloudiness: 0.24,
    overlay: "lush",
  },
  savanna: {
    palette: ["#79692f", "#9a8838", "#b79e49", "#d0ba63", "#8a8f3e", "#61763a", "#c69958"],
    waterRatio: 0.2,
    waterDeep: "#2e6188",
    waterShallow: "#78b3c9",
    wetLow: "#72843d",
    wetHigh: "#a5bb59",
    dryLow: "#8a7334",
    dryHigh: "#d6bf6c",
    peakLow: "#7c6f4d",
    peakHigh: "#d6cfad",
    cloudiness: 0.08,
  },
  wetlands: {
    palette: ["#3f5a36", "#546b3f", "#698651", "#7cae6c", "#4d6e55", "#64868c", "#8ebdb5"],
    waterRatio: 0.52,
    waterDeep: "#365968",
    waterShallow: "#85b6af",
    wetLow: "#4a643b",
    wetHigh: "#84b472",
    dryLow: "#72654a",
    dryHigh: "#8f8e67",
    peakLow: "#657560",
    peakHigh: "#d1decf",
    cloudiness: 0.2,
    overlay: "wetlands",
  },
  meadow: {
    palette: ["#567a31", "#6e9341", "#8db05b", "#b1ca79", "#d2dc93", "#7b8c63", "#d5c9a6"],
    waterRatio: 0.31,
    waterDeep: "#2f618d",
    waterShallow: "#86c4df",
    wetLow: "#68933f",
    wetHigh: "#b3cf74",
    dryLow: "#9f9059",
    dryHigh: "#d8d48f",
    peakLow: "#88926d",
    peakHigh: "#e1e2d1",
    cloudiness: 0.12,
  },
  desert: {
    palette: ["#a7703d", "#c28846", "#d9a95d", "#e6bf77", "#8b5a2b", "#b67a3c", "#f2d090"],
    waterRatio: 0.08,
    waterDeep: "#3f6487",
    waterShallow: "#8eb8d0",
    wetLow: "#9c7b4f",
    wetHigh: "#bea36b",
    dryLow: "#8b5a2b",
    dryHigh: "#f0ce8c",
    peakLow: "#a38964",
    peakHigh: "#f2e4c0",
    cloudiness: 0.04,
    overlay: "dunes",
  },
  arid: {
    palette: ["#6e5338", "#866748", "#a07c58", "#ba9368", "#8e7652", "#c2ab82", "#534538"],
    waterRatio: 0.03,
    waterDeep: "#43566b",
    waterShallow: "#7d98ab",
    wetLow: "#7d6849",
    wetHigh: "#b09369",
    dryLow: "#65503a",
    dryHigh: "#b99166",
    peakLow: "#897f6c",
    peakHigh: "#d8cfbe",
    cloudiness: 0.03,
  },
  dune: {
    palette: ["#c38b45", "#d6a55e", "#e8bf73", "#f0d48b", "#ae7639", "#f6e2a7", "#8f5f2c"],
    waterRatio: 0.01,
    waterDeep: "#54748f",
    waterShallow: "#92bdd7",
    wetLow: "#bc9657",
    wetHigh: "#ead08a",
    dryLow: "#a36c34",
    dryHigh: "#f3dda0",
    peakLow: "#c5af7f",
    peakHigh: "#fbefd0",
    cloudiness: 0.02,
    overlay: "dunes",
  },
  volcanic: {
    palette: ["#1d1a1b", "#2f2828", "#443636", "#5a4a44", "#7a6359", "#d06d2d", "#ffb15b"],
    waterRatio: 0.01,
    waterDeep: "#42343a",
    waterShallow: "#6b5a64",
    wetLow: "#3a2f31",
    wetHigh: "#665851",
    dryLow: "#231f20",
    dryHigh: "#554643",
    peakLow: "#5b534b",
    peakHigh: "#c8b29b",
    cloudiness: 0.05,
    overlay: "volcanic",
  },
  lava: {
    palette: ["#130d0d", "#2f1310", "#5a1710", "#8c2211", "#cf4618", "#ff7a22", "#ffd468"],
    waterRatio: 0,
    waterDeep: "#3f1d14",
    waterShallow: "#8d3a1a",
    wetLow: "#35140f",
    wetHigh: "#78321a",
    dryLow: "#190d0d",
    dryHigh: "#45140f",
    peakLow: "#5e2d16",
    peakHigh: "#f5a75f",
    cloudiness: 0.02,
    overlay: "lava",
  },
  toxic: {
    palette: ["#435718", "#5f7720", "#7f982a", "#aab73a", "#d3db51", "#53622d", "#786348"],
    waterRatio: 0.06,
    waterDeep: "#50683a",
    waterShallow: "#96aa60",
    wetLow: "#68852b",
    wetHigh: "#c2d24a",
    dryLow: "#5b6425",
    dryHigh: "#9c9246",
    peakLow: "#7d825d",
    peakHigh: "#d2d28e",
    cloudiness: 0.09,
    overlay: "toxic",
  },
  radioactive: {
    palette: ["#283320", "#3b4a2e", "#55653e", "#6f834f", "#9bc05d", "#46553a", "#c5f56c"],
    waterRatio: 0.03,
    waterDeep: "#2a5a4f",
    waterShallow: "#68a67c",
    wetLow: "#46553a",
    wetHigh: "#97ca61",
    dryLow: "#313a29",
    dryHigh: "#6b7e4b",
    peakLow: "#63675b",
    peakHigh: "#dde7b4",
    cloudiness: 0.05,
    overlay: "radioactive",
  },
  sulfuric: {
    palette: ["#625726", "#82702c", "#a58d32", "#cfb43d", "#e7d672", "#8e6132", "#b69858"],
    waterRatio: 0.04,
    waterDeep: "#6d6432",
    waterShallow: "#baa54c",
    wetLow: "#897631",
    wetHigh: "#d7c34b",
    dryLow: "#67572a",
    dryHigh: "#b99842",
    peakLow: "#8e8459",
    peakHigh: "#ede0a6",
    cloudiness: 0.06,
    overlay: "sulfuric",
  },
  crystal: {
    palette: ["#2b2558", "#43367b", "#5e4ea3", "#7d68c8", "#56b6d3", "#79d9e6", "#9befff"],
    waterRatio: 0.05,
    waterDeep: "#2f4e90",
    waterShallow: "#69b8eb",
    wetLow: "#4c438b",
    wetHigh: "#7a72d9",
    dryLow: "#403471",
    dryHigh: "#67c4e2",
    peakLow: "#8179d6",
    peakHigh: "#d3f9ff",
    cloudiness: 0.06,
    overlay: "crystal",
  },
  barren: {
    palette: ["#4c4138", "#5d4f44", "#746255", "#8c7767", "#a69181", "#625851", "#b5aa9d"],
    waterRatio: 0,
    waterDeep: "#4d4c54",
    waterShallow: "#898892",
    wetLow: "#65574d",
    wetHigh: "#8e7c6d",
    dryLow: "#4b4038",
    dryHigh: "#7f6d5f",
    peakLow: "#8f857d",
    peakHigh: "#d9d1ca",
    cloudiness: 0.01,
    overlay: "barren",
  },
  ice: {
    palette: ["#d9eef7", "#c4e5f5", "#a5d5ed", "#86c4e2", "#6ab0d5", "#e9f7fb", "#8ea4bc"],
    waterRatio: 0.44,
    waterDeep: "#5f90bd",
    waterShallow: "#d6eef9",
    wetLow: "#b7dae8",
    wetHigh: "#f0fbff",
    dryLow: "#9ec4d6",
    dryHigh: "#dfeef8",
    peakLow: "#d4e4ee",
    peakHigh: "#ffffff",
    cloudiness: 0.16,
    overlay: "glacial",
  },
  tundra: {
    palette: ["#6f8270", "#7f8f7f", "#96a39a", "#b9c3b5", "#d7e2dc", "#8fb1c9", "#eaf4f8"],
    waterRatio: 0.18,
    waterDeep: "#5f84a3",
    waterShallow: "#c6e2ef",
    wetLow: "#809882",
    wetHigh: "#c7d6c5",
    dryLow: "#7e8773",
    dryHigh: "#b8c2ab",
    peakLow: "#aab5b3",
    peakHigh: "#f7fbfb",
    cloudiness: 0.12,
  },
  glacial: {
    palette: ["#c8e5f2", "#aed7ee", "#8cc4e4", "#70add6", "#dff4ff", "#7ea2c5", "#eff9ff"],
    waterRatio: 0.28,
    waterDeep: "#5c87b4",
    waterShallow: "#d9f5ff",
    wetLow: "#9ecce0",
    wetHigh: "#e8fbff",
    dryLow: "#8fb4d2",
    dryHigh: "#cde8f2",
    peakLow: "#d5e6f3",
    peakHigh: "#ffffff",
    cloudiness: 0.14,
    overlay: "glacial",
  },
  snow: {
    palette: ["#d5e6ef", "#bfd4de", "#a7c0cc", "#e9f1f5", "#ffffff", "#738a9d", "#9fb2bf"],
    waterRatio: 0.16,
    waterDeep: "#6689a8",
    waterShallow: "#d4eaf4",
    wetLow: "#b0c6cf",
    wetHigh: "#eff5f8",
    dryLow: "#9aaeb9",
    dryHigh: "#d7e2e9",
    peakLow: "#d7e3ea",
    peakHigh: "#ffffff",
    cloudiness: 0.18,
  },
  permafrost: {
    palette: ["#8da0a9", "#9dafb6", "#b5c0c4", "#d0d9d8", "#edf2f0", "#94abb2", "#ced7df"],
    waterRatio: 0.12,
    waterDeep: "#718c9d",
    waterShallow: "#c6dde7",
    wetLow: "#a3b7b4",
    wetHigh: "#e5efed",
    dryLow: "#8a9896",
    dryHigh: "#c3cbc5",
    peakLow: "#bccbd1",
    peakHigh: "#fbfcfa",
    cloudiness: 0.1,
  },
  frozen_ocean: {
    palette: ["#82afcb", "#9ec7df", "#c5e3f3", "#e8f8ff", "#79a2c0", "#d6effa", "#effcff"],
    waterRatio: 0.65,
    waterDeep: "#6d97bd",
    waterShallow: "#eefcff",
    wetLow: "#aacfe5",
    wetHigh: "#f2fcff",
    dryLow: "#94b9d0",
    dryHigh: "#d8edf7",
    peakLow: "#d7edf9",
    peakHigh: "#ffffff",
    cloudiness: 0.14,
    overlay: "frozen-ocean",
  },
  ice_canyon: {
    palette: ["#5d92bb", "#76a9ce", "#97c8e8", "#c7e7f7", "#e2f4ff", "#8db4cf", "#274763"],
    waterRatio: 0.08,
    waterDeep: "#346690",
    waterShallow: "#c6e5f8",
    wetLow: "#8db7d8",
    wetHigh: "#ddf4ff",
    dryLow: "#719bc3",
    dryHigh: "#bde1f3",
    peakLow: "#d5ebf6",
    peakHigh: "#ffffff",
    cloudiness: 0.1,
    overlay: "ice-canyon",
  },
  cryo_volcanic: {
    palette: ["#8fb9d6", "#a2c9e0", "#c7e3f1", "#edf8ff", "#7f9ab9", "#9ee7ff", "#4e6a8d"],
    waterRatio: 0.14,
    waterDeep: "#567ca1",
    waterShallow: "#dff6ff",
    wetLow: "#a5cce0",
    wetHigh: "#f2fdff",
    dryLow: "#819ab8",
    dryHigh: "#b8cddd",
    peakLow: "#cfdeea",
    peakHigh: "#ffffff",
    cloudiness: 0.12,
    overlay: "cryo-volcanic",
  },
  polar_desert: {
    palette: ["#a8b5bf", "#bbc8ce", "#d6dedf", "#edf2f0", "#d7cfbf", "#f4f7f5", "#7c8586"],
    waterRatio: 0.02,
    waterDeep: "#8ba0ae",
    waterShallow: "#dce9ee",
    wetLow: "#c1d1d2",
    wetHigh: "#f0f6f3",
    dryLow: "#b6b09b",
    dryHigh: "#e3ddd0",
    peakLow: "#d7dfde",
    peakHigh: "#ffffff",
    cloudiness: 0.03,
    overlay: "polar-desert",
  },
  frost_crystal: {
    palette: ["#a9d4e8", "#c4e6f3", "#e2f7ff", "#f8fcff", "#9defff", "#a38df2", "#dde7ff"],
    waterRatio: 0.09,
    waterDeep: "#7ba6cc",
    waterShallow: "#dcf6ff",
    wetLow: "#bfe6f3",
    wetHigh: "#f4fdff",
    dryLow: "#b5d3e6",
    dryHigh: "#dff0ff",
    peakLow: "#e7f3ff",
    peakHigh: "#ffffff",
    cloudiness: 0.11,
    overlay: "frost-crystal",
  },
};

const GAS_PALETTES: string[][] = [
  ["#e7d8a0", "#c88f44", "#8e5e2d", "#5b7ea7", "#f6e6b2"],
  ["#f1c96b", "#d17c2e", "#7f4520", "#bf6fa0", "#ffe0b6"],
  ["#9ed7ef", "#5fa8d6", "#47649c", "#d4eff6", "#7bd0e6"],
  ["#d4c2f4", "#987cc9", "#5e4f9f", "#efdcff", "#63c0d6"],
  ["#d8d7c6", "#a8a595", "#77705e", "#ece8da", "#c89f63"],
  ["#d6d180", "#a89a41", "#67704b", "#ece7a4", "#d27d33"],
];

const pickBiomeProfile = (biome: PlanetBiome, variant: number): BiomeProfile => {
  const profile = BIOME_PROFILES[biome] ?? BIOME_PROFILES.temperate;
  return {
    ...profile,
    palette: rotatePalette(profile.palette, variant),
  };
};

const pickGasPalette = (variant: number): string[] => rotatePalette(GAS_PALETTES[variant % GAS_PALETTES.length] ?? GAS_PALETTES[0], variant);

export const biomeBaseColor = (biome: PlanetBiome): string => {
  const profile = BIOME_PROFILES[biome] ?? BIOME_PROFILES.temperate;
  return profile.palette[2] ?? profile.palette[0] ?? "#7d68c8";
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
  const variant = Math.abs([...input.seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % 24;
  const key = `planet:${TEXTURE_VERSION}:${input.type}:${input.biome}:${variant}:${input.seed}`;
  return withTextureCache(key, (ctx, size) => {
    const random = createSeededRandom(key);
    const palette = input.type === "gas" ? pickGasPalette(variant) : pickBiomeProfile(input.biome, variant).palette;
    const primary = palette[0] ?? "#345";
    const secondary = palette[Math.min(2, palette.length - 1)] ?? "#567";
    const accent = palette[Math.min(4, palette.length - 1)] ?? "#789";

    const base = ctx.createLinearGradient(0, 0, size, size);
    base.addColorStop(0, primary);
    base.addColorStop(1, secondary);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    if (input.type === "gas") {
      const bandCount = 42;
      for (let i = 0; i < bandCount; i += 1) {
        const t = i / bandCount;
        const bandBlend = (Math.sin(t * Math.PI * (5 + (variant % 4)) + variant * 0.7) + 1) / 2;
        const bandSeedColor = palette[(i + variant) % palette.length] ?? accent;
        const color = lerpColor(bandSeedColor, accent, bandBlend);
        const y = t * size + (random() * 14 - 7);
        const h = 6 + random() * 18;
        const alpha = 0.36 + random() * 0.28;
        const rgba = color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
        ctx.fillStyle = rgba;
        ctx.fillRect(0, y, size, h);
      }

      for (let i = 0; i < 16; i += 1) {
        const y = random() * size;
        const band = ctx.createLinearGradient(0, y, size, y + 18);
        band.addColorStop(0, "rgba(255,255,255,0)");
        band.addColorStop(0.3, `rgba(255,255,255,${0.05 + random() * 0.08})`);
        band.addColorStop(0.5, `rgba(255,255,255,${0.1 + random() * 0.14})`);
        band.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = band;
        ctx.fillRect(0, y, size, 18 + random() * 28);
      }

      for (let i = 0; i < 2; i += 1) {
        const stormX = size * (0.18 + random() * 0.64);
        const stormY = size * (0.2 + random() * 0.6);
        const storm = ctx.createRadialGradient(stormX, stormY, 8, stormX, stormY, 42 + random() * 48);
        storm.addColorStop(0, `rgba(255, 255, 255, ${0.24 + random() * 0.2})`);
        storm.addColorStop(0.3, `rgba(255, 238, 214, ${0.18 + random() * 0.16})`);
        storm.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = storm;
        ctx.beginPath();
        ctx.arc(stormX, stormY, 54 + random() * 18, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    const profile = pickBiomeProfile(input.biome, variant);
    const image = ctx.createImageData(size, size);
    const data = image.data;
    const seedA = `${key}:terrain`;
    const seedB = `${key}:moisture`;
    const seedC = `${key}:detail`;
    const waterThreshold = 1 - profile.waterRatio;
    const supportsRivers = [
      "gaia",
      "temperate",
      "continental",
      "archipelago",
      "forest",
      "jungle",
      "wetlands",
      "meadow",
      "tundra",
      "snow",
    ].includes(input.biome);
    const supportsBeaches = [
      "gaia",
      "temperate",
      "continental",
      "ocean",
      "archipelago",
      "meadow",
      "desert",
      "savanna",
      "wetlands",
      "frozen_ocean",
    ].includes(input.biome);
    const coldBiome = [
      "ice",
      "tundra",
      "glacial",
      "snow",
      "permafrost",
      "frozen_ocean",
      "ice_canyon",
      "cryo_volcanic",
      "polar_desert",
      "frost_crystal",
    ].includes(input.biome);
    const hotBiome = [
      "desert",
      "arid",
      "dune",
      "lava",
      "volcanic",
      "toxic",
      "radioactive",
      "sulfuric",
      "savanna",
      "jungle",
    ].includes(input.biome);

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const nx = x / size;
        const ny = y / size;
        const latitude = Math.abs(ny - 0.5) * 2;
        const latitudeCooling = smoothstep(0.24, 1, latitude);
        const continentMask = fractalNoise(`${seedA}:continents`, nx * 2.2, ny * 2.2, 4);
        const basinMask = fractalNoise(`${seedA}:basins`, nx * 3.1, ny * 3.1, 3);
        const elevation =
          fractalNoise(seedA, nx * (4.2 + (variant % 3)), ny * (4.2 + (variant % 3)), 5) * 0.58 +
          continentMask * 0.22 +
          fractalNoise(seedC, nx * 12.4, ny * 12.4, 3) * 0.22 +
          fractalNoise(`${seedC}:micro`, nx * 24.6, ny * 24.6, 2) * 0.08 -
          basinMask * (profile.waterRatio > 0.5 ? 0.12 : 0.05);
        const moisture = fractalNoise(seedB, nx * 4.4, ny * 4.4, 4);
        const heatBase = fractalNoise(`${seedB}:heat`, nx * 2.8, ny * 2.8, 3);
        const heat = clamp01(
          heatBase * 0.72 +
          (hotBiome ? 0.22 : 0) +
          (coldBiome ? -0.22 : 0) +
          (0.5 - latitudeCooling) * 0.32,
        );
        const ridges = fractalNoise(`${seedA}:ridge`, nx * 14.8, ny * 14.8, 3);
        const micro = fractalNoise(`${seedC}:surface`, nx * 30.5, ny * 30.5, 2);
        const riverMask = supportsRivers
          ? Math.abs(fractalNoise(`${seedB}:river`, nx * 7.2 + moisture * 0.6, ny * 7.2 + heat * 0.35, 3) - 0.5)
          : 1;
        const idx = (y * size + x) * 4;

        let color = secondary;
        if (elevation < waterThreshold) {
          const depthT = smoothstep(0, waterThreshold, elevation);
          color = depthT > 0.72 ? profile.waterShallow : lerpColor(profile.waterDeep, profile.waterShallow, depthT);
          if (coldBiome) {
            color = lerpColor(color, "#f3fbff", latitudeCooling * 0.2);
          }
        } else {
          const landT = smoothstep(waterThreshold, 1, elevation);
          const climateMix = clamp01(moisture * 0.62 + (1 - heat) * 0.18 + random() * 0.04);
          const lowland = climateMix > 0.52
            ? lerpColor(profile.wetLow, profile.wetHigh, landT)
            : lerpColor(profile.dryLow, profile.dryHigh, landT);
          const highland = lerpColor(profile.peakLow, profile.peakHigh, clamp01(landT * 0.9 + ridges * 0.25));
          color = landT > 0.68 ? lerpColor(lowland, highland, smoothstep(0.64, 1, landT)) : lowland;

          const coastBlend = smoothstep(waterThreshold, waterThreshold + 0.035, elevation);
          if (supportsBeaches && coastBlend < 0.9 && !coldBiome) {
            const beachColor =
              input.biome === "desert" || input.biome === "dune"
                ? "#efd59c"
                : input.biome === "archipelago"
                  ? "#f0dfb1"
                  : "#d9c58f";
            color = lerpColor(beachColor, color, coastBlend);
          }

          if (coldBiome) {
            color = lerpColor(color, "#eef7fb", latitudeCooling * 0.2 + landT * 0.08);
          } else if (hotBiome) {
            color = lerpColor(color, offsetColor(color, 18, 10, -4), heat * 0.18);
          }

          if (landT < 0.62) {
            color = lerpColor(color, offsetColor(color, -8, 6, -6), clamp01((0.5 - riverMask) * 5) * moisture * 0.32);
          }

          color = lerpColor(color, highland, clamp01(ridges * 0.22 + landT * 0.12));
          color = lerpColor(color, offsetColor(color, micro * 12 - 6, micro * 10 - 5, micro * 8 - 4), 0.18);
        }

        const [r, g, b] = parseColor(color);
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);

    if (supportsRivers) {
      for (let i = 0; i < 4; i += 1) {
        const startY = size * (0.16 + random() * 0.68);
        const amplitude = 10 + random() * 24;
        const frequency = 1.4 + random() * 2.2;
        const width = 0.7 + random() * 1.4;
        ctx.strokeStyle = coldBiome ? "rgba(214, 240, 250, 0.14)" : "rgba(96, 170, 196, 0.16)";
        ctx.lineWidth = width;
        ctx.beginPath();
        for (let x = 0; x <= size; x += 8) {
          const y =
            startY +
            Math.sin((x / size) * Math.PI * frequency + random() * Math.PI) * amplitude +
            Math.sin((x / size) * Math.PI * frequency * 0.45 + i) * (amplitude * 0.35);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    }

    if (profile.overlay === "lush" || profile.overlay === "wetlands") {
      for (let i = 0; i < 30; i += 1) {
        const x = random() * size;
        const y = random() * size;
        const growth = ctx.createRadialGradient(x, y, 0, x, y, 8 + random() * 16);
        growth.addColorStop(0, `rgba(36, 98, 39, ${0.05 + random() * 0.06})`);
        growth.addColorStop(1, "rgba(44, 92, 41, 0)");
        ctx.fillStyle = growth;
        ctx.beginPath();
        ctx.arc(x, y, 8 + random() * 16, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (profile.overlay === "dunes" || input.biome === "arid") {
      for (let i = 0; i < 28; i += 1) {
        const y = random() * size;
        const dune = ctx.createLinearGradient(0, y, size, y + 24);
        dune.addColorStop(0, "rgba(255,255,255,0)");
        dune.addColorStop(0.45, `rgba(255,245,214,${0.06 + random() * 0.06})`);
        dune.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = dune;
        ctx.fillRect(0, y, size, 12 + random() * 18);
      }
    }

    if (profile.overlay === "volcanic" || profile.overlay === "lava" || profile.overlay === "cryo-volcanic") {
      const glowBase =
        profile.overlay === "cryo-volcanic"
          ? "rgba(165, 240, 255,"
          : profile.overlay === "volcanic"
            ? "rgba(255, 133, 64,"
            : "rgba(255, 102, 24,";
      for (let i = 0; i < 18; i += 1) {
        const x = random() * size;
        const y = random() * size;
        const w = 18 + random() * 48;
        const h = 2 + random() * 5;
        ctx.fillStyle = `${glowBase} ${profile.overlay === "lava" ? 0.26 : 0.16})`;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(random() * Math.PI);
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
      }

      if (profile.overlay === "lava" || profile.overlay === "volcanic") {
        for (let i = 0; i < 8; i += 1) {
          const startX = random() * size;
          const startY = random() * size;
          ctx.strokeStyle = profile.overlay === "lava" ? "rgba(255, 132, 38, 0.22)" : "rgba(196, 88, 42, 0.16)";
          ctx.lineWidth = 1.2 + random() * 1.8;
          ctx.beginPath();
          for (let step = 0; step < 6; step += 1) {
            const px = startX + step * (8 + random() * 8);
            const py = startY + Math.sin(step * 0.9 + i) * (6 + random() * 7);
            if (step === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }
    }

    if (profile.overlay === "toxic" || profile.overlay === "radioactive" || profile.overlay === "sulfuric") {
      const tint =
        profile.overlay === "radioactive"
          ? "rgba(187, 255, 102,"
          : profile.overlay === "sulfuric"
            ? "rgba(255, 227, 89,"
            : "rgba(192, 238, 74,";
      for (let i = 0; i < 14; i += 1) {
        const x = random() * size;
        const y = random() * size;
        const haze = ctx.createRadialGradient(x, y, 0, x, y, 18 + random() * 30);
        haze.addColorStop(0, `${tint} ${0.1 + random() * 0.08})`);
        haze.addColorStop(1, `${tint} 0)`);
        ctx.fillStyle = haze;
        ctx.beginPath();
        ctx.arc(x, y, 20 + random() * 28, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (profile.overlay === "crystal" || profile.overlay === "frost-crystal") {
      const tint = profile.overlay === "frost-crystal" ? "rgba(214, 247, 255," : "rgba(162, 235, 255,";
      for (let i = 0; i < 22; i += 1) {
        const x = random() * size;
        const y = random() * size;
        ctx.fillStyle = `${tint} ${0.12 + random() * 0.08})`;
        ctx.beginPath();
        ctx.moveTo(x, y - 10 - random() * 14);
        ctx.lineTo(x + 6 + random() * 8, y);
        ctx.lineTo(x, y + 8 + random() * 12);
        ctx.lineTo(x - 5 - random() * 7, y);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (input.biome === "ocean" || input.biome === "archipelago" || input.biome === "frozen_ocean") {
      for (let i = 0; i < 18; i += 1) {
        const x = random() * size;
        const y = random() * size;
        const shelf = ctx.createRadialGradient(x, y, 0, x, y, 14 + random() * 30);
        shelf.addColorStop(0, input.biome === "frozen_ocean" ? "rgba(235, 248, 255, 0.08)" : "rgba(153, 220, 224, 0.08)");
        shelf.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = shelf;
        ctx.beginPath();
        ctx.arc(x, y, 14 + random() * 30, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (profile.overlay === "barren" || profile.overlay === "polar-desert") {
      for (let i = 0; i < 32; i += 1) {
        const x = random() * size;
        const y = random() * size;
        const radius = 3 + random() * 12;
        ctx.fillStyle = `rgba(40, 36, 34, ${0.06 + random() * 0.08})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (profile.overlay === "glacial" || profile.overlay === "frozen-ocean" || profile.overlay === "ice-canyon") {
      for (let i = 0; i < 16; i += 1) {
        const x = random() * size;
        const y = random() * size;
        ctx.strokeStyle = `rgba(225, 248, 255, ${0.08 + random() * 0.08})`;
        ctx.lineWidth = 1 + random() * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 12 + random() * 40, y + (random() * 18 - 9));
        ctx.stroke();
      }
    }

    for (let i = 0; i < Math.round(10 + profile.cloudiness * 40); i += 1) {
      const cx = random() * size;
      const cy = random() * size;
      const cloud = ctx.createRadialGradient(cx, cy, 2, cx, cy, 20 + random() * 36);
      cloud.addColorStop(0, `rgba(245, 250, 255, ${0.12 + profile.cloudiness * 0.5})`);
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
    const surfaceNoise = `${seed}:surface`;
    const ridgeNoise = `${seed}:ridge`;
    const bg = ctx.createLinearGradient(0, 0, size, size);
    bg.addColorStop(0, "#9ba5ac");
    bg.addColorStop(0.52, "#727d85");
    bg.addColorStop(1, "#414950");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    const image = ctx.createImageData(size, size);
    const data = image.data;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const nx = x / size;
        const ny = y / size;
        const large = fractalNoise(surfaceNoise, nx * 3.1, ny * 3.1, 4);
        const detail = fractalNoise(ridgeNoise, nx * 11.5, ny * 11.5, 3);
        const tone = Math.round(88 + large * 64 + detail * 34);
        const idx = (y * size + x) * 4;
        data[idx] = tone;
        data[idx + 1] = tone + 4;
        data[idx + 2] = tone + 8;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);

    for (let i = 0; i < 6; i += 1) {
      const x = random() * size;
      const y = random() * size;
      const radius = 26 + random() * 58;
      const maria = ctx.createRadialGradient(x, y, radius * 0.12, x, y, radius);
      maria.addColorStop(0, `rgba(72, 78, 84, ${0.22 + random() * 0.08})`);
      maria.addColorStop(0.7, `rgba(82, 88, 94, ${0.12 + random() * 0.08})`);
      maria.addColorStop(1, "rgba(82, 88, 94, 0)");
      ctx.fillStyle = maria;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 52; i += 1) {
      const x = random() * size;
      const y = random() * size;
      const radius = 4 + random() * 30;
      const shadowOffset = Math.max(1.2, radius * 0.14);
      const rimWidth = Math.max(0.8, radius * 0.09);

      ctx.strokeStyle = `rgba(205, 210, 214, ${0.14 + random() * 0.1})`;
      ctx.lineWidth = rimWidth;
      ctx.beginPath();
      ctx.arc(x - shadowOffset * 0.35, y - shadowOffset * 0.35, radius, 0, Math.PI * 2);
      ctx.stroke();

      const craterShadow = ctx.createRadialGradient(
        x + shadowOffset,
        y + shadowOffset,
        radius * 0.15,
        x + shadowOffset,
        y + shadowOffset,
        radius * 1.12,
      );
      craterShadow.addColorStop(0, `rgba(34, 38, 42, ${0.2 + random() * 0.12})`);
      craterShadow.addColorStop(0.72, `rgba(52, 56, 60, ${0.08 + random() * 0.08})`);
      craterShadow.addColorStop(1, "rgba(52, 56, 60, 0)");
      ctx.fillStyle = craterShadow;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      const craterFloor = ctx.createRadialGradient(
        x + shadowOffset * 0.55,
        y + shadowOffset * 0.55,
        radius * 0.08,
        x + shadowOffset * 0.55,
        y + shadowOffset * 0.55,
        radius * 0.88,
      );
      craterFloor.addColorStop(0, `rgba(58, 62, 66, ${0.18 + random() * 0.08})`);
      craterFloor.addColorStop(1, "rgba(58, 62, 66, 0)");
      ctx.fillStyle = craterFloor;
      ctx.beginPath();
      ctx.arc(x + shadowOffset * 0.2, y + shadowOffset * 0.2, radius * 0.86, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 18; i += 1) {
      const x = random() * size;
      const y = random() * size;
      const highlight = ctx.createRadialGradient(x, y, 2, x, y, 10 + random() * 18);
      highlight.addColorStop(0, "rgba(235,240,244,0.12)");
      highlight.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = highlight;
      ctx.beginPath();
      ctx.arc(x, y, 10 + random() * 18, 0, Math.PI * 2);
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
