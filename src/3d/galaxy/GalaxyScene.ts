import {
  Color,
  Group,
  InstancedMesh,
  Intersection,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
} from "three";
import { EventBridge } from "../core/EventBridge";
import { IRenderableScene } from "../core/SceneManager";
import { SerializedGalaxyNode } from "../core/serialized.types";
import { StarInstanceMesh } from "./StarInstanceMesh";

const SYSTEM_ID = Symbol("systemId");
const INSTANCE_INDEX_TO_SYSTEM = Symbol("instanceIndexToSystem");
const INSTANCING_THRESHOLD = 100;

export class GalaxyScene implements IRenderableScene {
  readonly kind = "galaxy" as const;
  readonly group = new Group();
  private readonly eventBridge: EventBridge;

  constructor(eventBridge: EventBridge, nodes: SerializedGalaxyNode[]) {
    this.eventBridge = eventBridge;
    if (nodes.length > INSTANCING_THRESHOLD) {
      const stars = StarInstanceMesh.build(nodes);
      (stars.userData as Record<symbol, string[]>)[INSTANCE_INDEX_TO_SYSTEM] = nodes.map(
        (node) => node.systemId,
      );
      this.group.add(stars);
      return;
    }

    const geometry = new SphereGeometry(1, 14, 14);
    nodes.forEach((node) => {
      const mesh = new Mesh(
        geometry.clone(),
        new MeshBasicMaterial({ color: new Color(node.color ?? "#f8ffe5") }),
      );
      const scale = Math.max(node.size ?? 1.5, 0.2);
      mesh.scale.setScalar(scale);
      mesh.position.set(node.position.x, node.position.y, node.position.z);
      (mesh.userData as Record<symbol, string>)[SYSTEM_ID] = node.systemId;
      this.group.add(mesh);
    });
  }

  update(_deltaSeconds: number): void {}

  onPointerDown(intersections: Intersection<Object3D>[]): void {
    if (intersections.length === 0) {
      this.eventBridge.emit("backgroundClicked", undefined);
      return;
    }

    const hit = intersections[0].object;
    const systemId = this.findSystemId(intersections[0], hit);
    if (!systemId) return;

    this.eventBridge.emit("systemClicked", { systemId });
    this.eventBridge.emit("requestSystemView", { systemId });
  }

  onPointerMove(intersections: Intersection<Object3D>[]): void {
    if (intersections.length === 0) {
      this.eventBridge.emit("hoverCleared", undefined);
      return;
    }

    const hit = intersections[0].object;
    const systemId = this.findSystemId(intersections[0], hit);
    if (!systemId) {
      this.eventBridge.emit("hoverCleared", undefined);
      return;
    }

    this.eventBridge.emit("systemHovered", { systemId });
  }

  dispose(): void {
    this.group.traverse((obj) => {
      const anyObj = obj as unknown as {
        geometry?: { dispose: () => void };
        material?: { dispose: () => void } | { dispose: () => void }[];
      };
      anyObj.geometry?.dispose?.();
      if (Array.isArray(anyObj.material)) {
        anyObj.material.forEach((mat) => mat.dispose());
      } else {
        anyObj.material?.dispose?.();
      }
    });
    this.group.clear();
  }

  private findSystemId(
    intersection: Intersection<Object3D>,
    object: Object3D,
  ): string | null {
    if (object instanceof InstancedMesh && intersection.instanceId != null) {
      const mapping = (object.userData as Record<symbol, string[]>)[INSTANCE_INDEX_TO_SYSTEM];
      return mapping?.[intersection.instanceId] ?? null;
    }

    let current: Object3D | null = object;
    while (current) {
      const value = (current.userData as Record<symbol, string>)[SYSTEM_ID];
      if (value) return value;
      current = current.parent;
    }
    return null;
  }
}
