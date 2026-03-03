import { Color, Mesh, MeshStandardMaterial, SphereGeometry } from "three";

export class PlanetMesh {
  static create(size: number, color = "#0da1bf"): Mesh {
    const tone = new Color(color);
    const geometry = new SphereGeometry(Math.max(size, 0.4), 16, 16);
    const material = new MeshStandardMaterial({
      color: tone,
      emissive: tone.clone().multiplyScalar(0.18),
      emissiveIntensity: 0.7,
      roughness: 0.72,
      metalness: 0.05,
    });
    return new Mesh(geometry, material);
  }
}
