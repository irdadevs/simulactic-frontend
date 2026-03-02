import { BufferGeometry, Color, Float32BufferAttribute, Line, LineBasicMaterial } from "three";

export class OrbitHelper {
  static create(radius: number, color = "#5f6d65", segments = 96): Line {
    const positions: number[] = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = (i / segments) * Math.PI * 2;
      positions.push(Math.cos(t) * radius, 0, Math.sin(t) * radius);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    const material = new LineBasicMaterial({
      color: new Color(color),
      transparent: true,
      opacity: 0.35,
    });
    return new Line(geometry, material);
  }
}
