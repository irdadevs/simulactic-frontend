import { Color, Mesh, MeshStandardMaterial, SphereGeometry } from "three";
import { PlanetBiome, PlanetType } from "../../types/planet.types";
import { biomeBaseColor, createMoonTexture, createPlanetTexture } from "./CelestialTextures";

export class PlanetMesh {
  static create(
    size: number,
    color = "#0da1bf",
    input?: {
      seed?: string;
      kind?: "planet" | "moon";
      biome?: PlanetBiome;
      planetType?: PlanetType;
    },
  ): Mesh {
    const resolvedColor =
      input?.kind === "moon"
        ? color
        : color === "#ffffff"
          ? biomeBaseColor(input?.biome ?? "temperate")
          : color;
    const tone = new Color(resolvedColor);
    const geometry = new SphereGeometry(Math.max(size, 0.4), 28, 28);
    const seed = input?.seed ?? `seed:${size}:${color}`;
    const map =
      input?.kind === "moon"
        ? createMoonTexture(seed)
        : createPlanetTexture({
            seed,
            biome: input?.biome ?? "temperate",
            type: input?.planetType ?? "solid",
          });

    const material = new MeshStandardMaterial({
      color: input?.kind === "moon" ? tone : new Color("#f2f4f5"),
      map,
      emissive: input?.kind === "moon" ? tone.clone().multiplyScalar(0.1) : tone.clone().multiplyScalar(0.08),
      emissiveIntensity: input?.kind === "moon" ? 0.42 : 0.35,
      roughness: input?.kind === "moon" ? 0.8 : input?.planetType === "gas" ? 0.5 : 0.62,
      metalness: input?.kind === "moon" ? 0.03 : 0.06,
    });
    return new Mesh(geometry, material);
  }
}
