import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { createAsteroidTexture } from "./CelestialTextures";

type RandomFn = () => number;

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

const jitterGeometry = (geometry: BufferGeometry, random: RandomFn, jitter: number): BufferGeometry => {
  const clone = geometry.clone();
  const attr = clone.getAttribute("position");
  const array = Float32Array.from(attr.array as ArrayLike<number>);
  for (let i = 0; i < array.length; i += 3) {
    const factor = 1 + (random() * 2 - 1) * jitter;
    array[i] *= factor;
    array[i + 1] *= factor;
    array[i + 2] *= factor;
  }
  clone.setAttribute("position", new Float32BufferAttribute(array, 3));
  clone.computeVertexNormals();
  return clone;
};

const createIrregularRock = (size: number, color: string, seed: string, random: RandomFn): Mesh => {
  const base = new IcosahedronGeometry(Math.max(size, 0.18), 1);
  const geometry = jitterGeometry(base, random, 0.28);
  base.dispose();
  const map = createAsteroidTexture(seed);

  return new Mesh(
    geometry,
    new MeshStandardMaterial({
      color: "#b49a7f",
      map,
      emissive: "#7a5d43",
      emissiveIntensity: 0.03 + random() * 0.03,
      roughness: 0.78,
      metalness: 0.06 + random() * 0.08,
    }),
  );
};

const clusterCountBySize = (size: number): number => {
  if (size >= 1.1) return 14;
  if (size >= 0.8) return 11;
  if (size >= 0.55) return 8;
  return 5;
};

export class AsteroidMesh {
  static createSingle(size: number, color: string, seed: string): Mesh {
    const random = createSeededRandom(seed);
    return createIrregularRock(size, color, seed, random);
  }

  static createCluster(size: number, color: string, seed: string): Group {
    const random = createSeededRandom(seed);
    const cluster = new Group();
    const count = clusterCountBySize(size);
    const spread = Math.max(1.1, size * 2.6);

    for (let i = 0; i < count; i += 1) {
      const partScale = size * (0.28 + random() * 0.45);
      const rock = createIrregularRock(partScale, color, `${seed}:${i}`, random);
      rock.position.set(
        (random() * 2 - 1) * spread,
        (random() * 2 - 1) * (spread * 0.35),
        (random() * 2 - 1) * spread,
      );
      rock.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
      cluster.add(rock);
    }

    return cluster;
  }
}
