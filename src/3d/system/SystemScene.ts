import {
  Color,
  Group,
  Intersection,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  SphereGeometry,
} from "three";
import { EventBridge } from "../core/EventBridge";
import { IRenderableScene } from "../core/SceneManager";
import { SerializedSystemData } from "../core/serialized.types";
import { OrbitRenderer } from "./OrbitRenderer";
import { PlanetMesh } from "./PlanetMesh";

const SYSTEM_ID = Symbol("systemId");
const STAR_ID = Symbol("starId");
const PLANET_ID = Symbol("planetId");
const MOON_ID = Symbol("moonId");
const ASTEROID_ID = Symbol("asteroidId");

export class SystemScene implements IRenderableScene {
  readonly kind = "system" as const;
  readonly group = new Group();
  private readonly data: SerializedSystemData;
  private readonly eventBridge: EventBridge;

  constructor(eventBridge: EventBridge, data: SerializedSystemData) {
    this.eventBridge = eventBridge;
    this.data = data;

    this.buildLighting();
    this.buildStars();
    this.buildPlanets();
    this.buildAsteroids();
  }

  update(_deltaSeconds: number): void {}

  onPointerDown(intersections: Intersection<Object3D>[]): void {
    if (intersections.length === 0) {
      this.eventBridge.emit("backgroundClicked", undefined);
      return;
    }

    const hit = intersections[0].object;
    const starId = this.findStarId(hit);
    if (!starId) return;

    this.eventBridge.emit("starClicked", {
      starId,
      systemId: this.data.systemId,
    });
  }

  onPointerMove(intersections: Intersection<Object3D>[]): void {
    if (intersections.length === 0) {
      this.eventBridge.emit("hoverCleared", undefined);
      return;
    }

    const object = intersections[0].object;
    const starId = this.findStarId(object);
    if (starId) {
      this.eventBridge.emit("starHovered", {
        starId,
        systemId: this.data.systemId,
      });
      return;
    }

    const planetId = this.findTaggedId(object, PLANET_ID);
    if (planetId) {
      this.eventBridge.emit("planetHovered", { planetId });
      return;
    }

    const moonId = this.findTaggedId(object, MOON_ID);
    if (moonId) {
      this.eventBridge.emit("moonHovered", { moonId });
      return;
    }

    const asteroidId = this.findTaggedId(object, ASTEROID_ID);
    if (asteroidId) {
      this.eventBridge.emit("asteroidHovered", { asteroidId });
      return;
    }

    this.eventBridge.emit("hoverCleared", undefined);
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

  private buildLighting(): void {
    const mainLight = new PointLight("#f8ffe5", 1.8, 2200, 2);
    mainLight.position.set(0, 0, 0);
    this.group.add(mainLight);
  }

  private buildStars(): void {
    this.data.stars.forEach((star) => {
      const mesh = new Mesh(
        new SphereGeometry(Math.max(star.size, 0.8), 20, 20),
        new MeshStandardMaterial({
          color: new Color(star.color ?? (star.isMain ? "#f8ffe5" : "#ffffff")),
          emissive: new Color(star.color ?? "#f8ffe5"),
          emissiveIntensity: star.isMain ? 0.7 : 0.35,
          roughness: 0.4,
        }),
      );

      const x = star.orbital * 20;
      mesh.position.set(x, 0, 0);
      (mesh.userData as Record<symbol, string>)[STAR_ID] = star.starId;
      (mesh.userData as Record<symbol, string>)[SYSTEM_ID] = this.data.systemId;
      this.group.add(mesh);

      if (star.orbital > 0) {
        this.group.add(OrbitRenderer.create(star.orbital * 20, "#47524b"));
      }
    });
  }

  private buildPlanets(): void {
    this.data.planets.forEach((planet) => {
      const radius = planet.orbital * 30;
      const mesh = PlanetMesh.create(planet.size, planet.color ?? "#0da1bf");
      mesh.position.set(radius, 0, 0);
      (mesh.userData as Record<symbol, string>)[PLANET_ID] = planet.planetId;
      this.group.add(mesh);
      this.group.add(OrbitRenderer.create(radius));

      (planet.moons ?? []).forEach((moon, index) => {
        const moonMesh = PlanetMesh.create(moon.size, moon.color ?? "#c8d0cb");
        moonMesh.position.set(radius + moon.orbital * 4 + index, 0, 0);
        (moonMesh.userData as Record<symbol, string>)[MOON_ID] = moon.moonId;
        this.group.add(moonMesh);
      });
    });
  }

  private buildAsteroids(): void {
    (this.data.asteroids ?? []).forEach((asteroid) => {
      const mesh = PlanetMesh.create(asteroid.size, asteroid.color ?? "#77887e");
      mesh.position.set(asteroid.orbital * 30, 0, 0);
      (mesh.userData as Record<symbol, string>)[ASTEROID_ID] = asteroid.asteroidId;
      this.group.add(mesh);
    });
  }

  private findStarId(object: Object3D): string | null {
    return this.findTaggedId(object, STAR_ID);
  }

  private findTaggedId(object: Object3D, symbol: symbol): string | null {
    let current: Object3D | null = object;
    while (current) {
      const value = (current.userData as Record<symbol, string>)[symbol];
      if (value) return value;
      current = current.parent;
    }
    return null;
  }
}
