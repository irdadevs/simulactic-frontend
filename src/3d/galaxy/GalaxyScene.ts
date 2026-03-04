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
import { StarInstancedMesh } from "./StarInstancedMesh";

const SYSTEM_ID = Symbol("systemId");
const INSTANCE_INDEX_TO_SYSTEM = Symbol("instanceIndexToSystem");
const INSTANCING_THRESHOLD = 100;

export class GalaxyScene implements IRenderableScene {
  readonly kind = "galaxy" as const;
  readonly group = new Group();
  private readonly eventBridge: EventBridge;
  private mounted = false;

  constructor(eventBridge: EventBridge) {
    this.eventBridge = eventBridge;
  }

  mount(input: {
    systems: {
      id: string;
      x: number;
      y: number;
      z: number;
      color?: string;
      size?: number;
    }[];
  }): void {
    this.dispose();
    this.mounted = true;
    const systems = this.normalizeSystems(input.systems);

    if (systems.length > INSTANCING_THRESHOLD) {
      const stars = StarInstancedMesh.build(systems);
      (stars.userData as Record<symbol, string[]>)[INSTANCE_INDEX_TO_SYSTEM] = systems.map(
        (system) => system.id,
      );
      this.group.add(stars);
      return;
    }

    const geometry = new SphereGeometry(1, 14, 14);
    systems.forEach((system) => {
      const mesh = new Mesh(
        geometry.clone(),
        new MeshBasicMaterial({ color: new Color(system.color ?? "#f8ffe5") }),
      );
      mesh.scale.setScalar(Math.max(system.size ?? 2, 1.1));
      mesh.position.set(system.x, system.y, system.z);
      (mesh.userData as Record<symbol, string>)[SYSTEM_ID] = system.id;
      this.group.add(mesh);
    });
  }

  update(_deltaSeconds: number): void {}

  onPointerDown(intersections: Intersection<Object3D>[], _pointer: { x: number; y: number }): void {
    if (intersections.length === 0) {
      this.eventBridge.emit("backgroundClicked", undefined);
      return;
    }

    const hit = intersections[0].object;
    const intersection = intersections[0];
    const systemId = this.findSystemId(intersection, hit);
    if (!systemId) return;

    this.eventBridge.emit("systemClicked", {
      systemId,
      focusPoint: {
        x: intersection.point.x,
        y: intersection.point.y,
        z: intersection.point.z,
      },
      anchor: _pointer,
    });
  }

  onPointerMove(
    intersections: Intersection<Object3D>[],
    pointer: { x: number; y: number },
  ): void {
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

    this.eventBridge.emit("systemHovered", { systemId, anchor: pointer });
  }

  dispose(): void {
    if (!this.mounted && this.group.children.length === 0) return;
    this.mounted = false;
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

  private normalizeSystems(
    systems: Array<{ id: string; x: number; y: number; z: number; color?: string; size?: number }>,
  ): Array<{ id: string; x: number; y: number; z: number; color?: string; size?: number }> {
    if (systems.length === 0) return systems;

    const center = systems.reduce(
      (acc, system) => ({
        x: acc.x + system.x,
        y: acc.y + system.y,
        z: acc.z + system.z,
      }),
      { x: 0, y: 0, z: 0 },
    );

    const centroid = {
      x: center.x / systems.length,
      y: center.y / systems.length,
      z: center.z / systems.length,
    };

    const maxDistance = systems.reduce((max, system) => {
      const dx = system.x - centroid.x;
      const dy = system.y - centroid.y;
      const dz = system.z - centroid.z;
      return Math.max(max, Math.sqrt(dx * dx + dy * dy + dz * dz));
    }, 0);

    if (maxDistance <= 0) return systems;

    const targetRadius = 180;
    const scale = Math.max(0.25, Math.min(7.5, targetRadius / maxDistance));

    return systems.map((system) => ({
      id: system.id,
      x: (system.x - centroid.x) * scale,
      y: (system.y - centroid.y) * scale,
      z: (system.z - centroid.z) * scale,
      color: system.color,
      size: system.size,
    }));
  }
}
