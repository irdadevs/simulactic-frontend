import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
} from "three";

type OrbitLineStyle = "continuous" | "dashed" | "dotted";

export class OrbitHelper {
  static create(
    radius: number,
    color = "#5f6d65",
    segments = 96,
    style: OrbitLineStyle = "continuous",
  ): Line {
    const positions: number[] = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = (i / segments) * Math.PI * 2;
      positions.push(Math.cos(t) * radius, 0, Math.sin(t) * radius);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));

    if (style === "continuous") {
      const material = new LineBasicMaterial({
        color: new Color(color),
        transparent: true,
        opacity: 0.35,
      });
      return new Line(geometry, material);
    }

    const material = new LineDashedMaterial({
      color: new Color(color),
      transparent: true,
      opacity: 0.45,
      dashSize: style === "dashed" ? 2.2 : 0.6,
      gapSize: style === "dashed" ? 1.4 : 1.2,
    });

    const line = new Line(geometry, material);
    line.computeLineDistances();
    return line;
  }
}
