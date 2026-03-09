import {
  Group,
  Intersection,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
} from "three";
import { StarType } from "../../types/star.types";
import { EventBridge } from "../core/EventBridge";
import { IRenderableScene } from "../core/SceneManager";
import { StarVisualFactory } from "../system/StarVisualFactory";

const SYSTEM_ID = Symbol("systemId");

type GalaxyMarkerInput = {
  id: string;
  x: number;
  y: number;
  z: number;
  color?: string;
  size?: number;
  representativeStarType?: StarType;
  hasBlackHole?: boolean;
  hasNeutronStar?: boolean;
};

export class GalaxyScene implements IRenderableScene {
  readonly kind = "galaxy" as const;
  readonly group = new Group();
  private readonly eventBridge: EventBridge;
  private readonly systemPositions = new Map<string, { x: number; y: number; z: number }>();
  private mounted = false;

  constructor(eventBridge: EventBridge) {
    this.eventBridge = eventBridge;
  }

  mount(input: { systems: GalaxyMarkerInput[] }): void {
    this.dispose();
    this.mounted = true;
    const systems = this.normalizeSystems(input.systems);
    systems.forEach((system) => {
      this.systemPositions.set(system.id, {
        x: system.x,
        y: system.y,
        z: system.z,
      });
      this.group.add(this.buildSystemMarker(system));
    });
  }

  update(_deltaSeconds: number): void {}

  onPointerDown(intersections: Intersection<Object3D>[], pointer: { x: number; y: number }): void {
    if (intersections.length === 0) {
      this.eventBridge.emit("backgroundClicked", undefined);
      return;
    }

    const intersection = intersections[0];
    const systemId = this.findSystemId(intersection.object);
    if (!systemId) return;

    this.eventBridge.emit("systemClicked", {
      systemId,
      focusPoint: {
        x: intersection.point.x,
        y: intersection.point.y,
        z: intersection.point.z,
      },
      anchor: pointer,
    });
  }

  onPointerMove(intersections: Intersection<Object3D>[], pointer: { x: number; y: number }): void {
    if (intersections.length === 0) {
      this.eventBridge.emit("hoverCleared", undefined);
      return;
    }

    const systemId = this.findSystemId(intersections[0].object);
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
    this.systemPositions.clear();
  }

  getSystemPoint(systemId: string): { x: number; y: number; z: number } | null {
    return this.systemPositions.get(systemId) ?? null;
  }

  private findSystemId(object: Object3D): string | null {
    let current: Object3D | null = object;
    while (current) {
      const value = (current.userData as Record<symbol, string>)[SYSTEM_ID];
      if (value) return value;
      current = current.parent;
    }
    return null;
  }

  private normalizeSystems(systems: GalaxyMarkerInput[]): GalaxyMarkerInput[] {
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
      ...system,
      x: (system.x - centroid.x) * scale,
      y: (system.y - centroid.y) * scale,
      z: (system.z - centroid.z) * scale,
    }));
  }

  private buildSystemMarker(system: GalaxyMarkerInput): Group {
    const marker = new Group();
    marker.position.set(system.x, system.y, system.z);

    const starType =
      system.hasBlackHole
        ? "Black hole"
        : system.hasNeutronStar
          ? "Neutron star"
          : system.representativeStarType ?? "Yellow dwarf";
    const visual = StarVisualFactory.create({
      starId: system.id,
      starType,
      size: Math.max((system.size ?? 2) * 0.38, 0.56),
      color: system.color,
      isMain: true,
    });

    visual.traverse((node) => {
      (node.userData as Record<symbol, string>)[SYSTEM_ID] = system.id;
    });

    marker.add(visual);

    // Click target slightly larger than the rendered marker to keep interaction easy.
    const hitArea = new Mesh(
      new SphereGeometry(Math.max((system.size ?? 2) * 0.6, 1.2), 12, 12),
      new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    (hitArea.userData as Record<symbol, string>)[SYSTEM_ID] = system.id;
    marker.add(hitArea);

    return marker;
  }
}
