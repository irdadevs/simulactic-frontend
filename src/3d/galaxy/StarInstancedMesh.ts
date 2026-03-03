import {
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  SphereGeometry,
} from "three";

export type GalaxySystemPoint = {
  id: string;
  x: number;
  y: number;
  z: number;
  color?: string;
  size?: number;
};

export class StarInstancedMesh {
  static build(systems: GalaxySystemPoint[]): InstancedMesh {
    const geometry = new SphereGeometry(1, 10, 10);
    const material = new MeshBasicMaterial({ color: new Color("#f8ffe5") });
    const mesh = new InstancedMesh(geometry, material, systems.length);
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.frustumCulled = false;

    const matrix = new Matrix4();
    systems.forEach((system, index) => {
      const size = Math.max(system.size ?? 2.2, 1.1);
      matrix.makeScale(size, size, size);
      matrix.setPosition(system.x, system.y, system.z);
      mesh.setMatrixAt(index, matrix);
      mesh.setColorAt(index, new Color(system.color ?? "#f8ffe5"));
    });

    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }
}
