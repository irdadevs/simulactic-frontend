import {
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  SphereGeometry,
} from "three";
import { SerializedGalaxyNode } from "../core/serialized.types";

export class StarInstanceMesh {
  static build(nodes: SerializedGalaxyNode[]): InstancedMesh {
    const geometry = new SphereGeometry(1, 10, 10);
    const material = new MeshBasicMaterial({ color: new Color("#f8ffe5") });
    const mesh = new InstancedMesh(geometry, material, nodes.length);
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.frustumCulled = false;

    const matrix = new Matrix4();
    nodes.forEach((node, index) => {
      const size = Math.max(node.size ?? 1.5, 0.2);
      matrix.makeScale(size, size, size);
      matrix.setPosition(node.position.x, node.position.y, node.position.z);
      mesh.setMatrixAt(index, matrix);
      mesh.setColorAt(index, new Color(node.color ?? "#f8ffe5"));
    });
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }
}
