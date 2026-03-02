import { Color, Mesh, MeshStandardMaterial, SphereGeometry } from "three";

export class PlanetMesh {
  static create(size: number, color = "#0da1bf"): Mesh {
    const geometry = new SphereGeometry(Math.max(size, 0.4), 16, 16);
    const material = new MeshStandardMaterial({
      color: new Color(color),
      roughness: 0.9,
      metalness: 0.05,
    });
    return new Mesh(geometry, material);
  }
}
