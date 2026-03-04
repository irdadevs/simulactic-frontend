import {
  Color,
  Group,
  Intersection,
  AmbientLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  SphereGeometry,
} from "three";
import { EventBridge } from "../core/EventBridge";
import { IRenderableScene } from "../core/SceneManager";
import { OrbitHelper } from "./OrbitHelper";
import { PlanetMesh } from "./PlanetMesh";

const SYSTEM_ID = Symbol("systemId");
const STAR_ID = Symbol("starId");
const PLANET_ID = Symbol("planetId");
const MOON_ID = Symbol("moonId");
const ASTEROID_ID = Symbol("asteroidId");

export class SystemScene implements IRenderableScene {
  readonly kind = "system" as const;
  readonly group = new Group();
  private data: {
    systemId: string;
    stars: Array<{
      starId: string;
      isMain: boolean;
      orbital: number;
      size: number;
      color?: string;
    }>;
    planets: Array<{
      planetId: string;
      orbital: number;
      size: number;
      color?: string;
      moons?: Array<{
        moonId: string;
        orbital: number;
        size: number;
        color?: string;
      }>;
    }>;
    asteroids?: Array<{
      asteroidId: string;
      orbital: number;
      size: number;
      color?: string;
    }>;
  } = {
    systemId: "",
    stars: [],
    planets: [],
    asteroids: [],
  };
  private readonly eventBridge: EventBridge;
  private readonly navigationPoints = {
    star: new Map<string, { x: number; y: number; z: number }>(),
    planet: new Map<string, { x: number; y: number; z: number }>(),
    moon: new Map<string, { x: number; y: number; z: number }>(),
    asteroid: new Map<string, { x: number; y: number; z: number }>(),
  };
  private mounted = false;

  constructor(eventBridge: EventBridge) {
    this.eventBridge = eventBridge;
  }

  mount(data: {
    systemId: string;
    stars: Array<{
      starId: string;
      isMain: boolean;
      orbital: number;
      size: number;
      color?: string;
    }>;
    planets: Array<{
      planetId: string;
      orbital: number;
      size: number;
      color?: string;
      moons?: Array<{
        moonId: string;
        orbital: number;
        size: number;
        color?: string;
      }>;
    }>;
    asteroids?: Array<{
      asteroidId: string;
      orbital: number;
      size: number;
      color?: string;
    }>;
  }): void {
    this.dispose();
    this.mounted = true;
    this.data = data;
    this.buildLighting();
    this.buildStars();
    this.buildPlanets();
    this.buildAsteroids();
  }

  update(_deltaSeconds: number): void {}

  onPointerDown(intersections: Intersection<Object3D>[], _pointer: { x: number; y: number }): void {
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

    const object = intersections[0].object;
    const starId = this.findStarId(object);
    if (starId) {
      this.eventBridge.emit("starHovered", {
        systemId: this.data.systemId,
        starId,
        anchor: pointer,
      });
      return;
    }

    const planetId = this.findTaggedId(object, PLANET_ID);
    if (planetId) {
      this.eventBridge.emit("planetHovered", {
        systemId: this.data.systemId,
        planetId,
        anchor: pointer,
      });
      return;
    }

    const moonId = this.findTaggedId(object, MOON_ID);
    if (moonId) {
      this.eventBridge.emit("moonHovered", {
        systemId: this.data.systemId,
        moonId,
        anchor: pointer,
      });
      return;
    }

    const asteroidId = this.findTaggedId(object, ASTEROID_ID);
    if (asteroidId) {
      this.eventBridge.emit("asteroidHovered", {
        systemId: this.data.systemId,
        asteroidId,
        anchor: pointer,
      });
      return;
    }

    this.eventBridge.emit("hoverCleared", undefined);
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
    this.navigationPoints.star.clear();
    this.navigationPoints.planet.clear();
    this.navigationPoints.moon.clear();
    this.navigationPoints.asteroid.clear();
  }

  getNavigationPoint(
    target: { kind: "star" | "planet" | "moon" | "asteroid"; id: string },
  ): { x: number; y: number; z: number } | null {
    return this.navigationPoints[target.kind].get(target.id) ?? null;
  }

  private buildLighting(): void {
    const ambient = new AmbientLight("#9fb2ff", 0.45);
    this.group.add(ambient);

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

      const x = star.orbital * 16;
      mesh.position.set(x, 0, 0);
      (mesh.userData as Record<symbol, string>)[STAR_ID] = star.starId;
      (mesh.userData as Record<symbol, string>)[SYSTEM_ID] = this.data.systemId;
      this.group.add(mesh);
      this.navigationPoints.star.set(star.starId, { x, y: 0, z: 0 });

      if (star.orbital > 0) {
        this.group.add(OrbitHelper.create(star.orbital * 16, "#47524b"));
      }
    });
  }

  private buildPlanets(): void {
    this.data.planets.forEach((planet) => {
      const radius = planet.orbital * 20;
      const mesh = PlanetMesh.create(planet.size, planet.color ?? "#0da1bf");
      mesh.position.set(radius, 0, 0);
      (mesh.userData as Record<symbol, string>)[PLANET_ID] = planet.planetId;
      this.group.add(mesh);
      this.navigationPoints.planet.set(planet.planetId, { x: radius, y: 0, z: 0 });
      this.group.add(OrbitHelper.create(radius));

      (planet.moons ?? []).forEach((moon, index) => {
        const moonMesh = PlanetMesh.create(moon.size, moon.color ?? "#c8d0cb");
        moonMesh.position.set(radius + moon.orbital * 2.6 + index * 0.75, 0, 0);
        const moonX = radius + moon.orbital * 2.6 + index * 0.75;
        (moonMesh.userData as Record<symbol, string>)[MOON_ID] = moon.moonId;
        this.group.add(moonMesh);
        this.navigationPoints.moon.set(moon.moonId, { x: moonX, y: 0, z: 0 });
      });
    });
  }

  private buildAsteroids(): void {
    (this.data.asteroids ?? []).forEach((asteroid) => {
      const mesh = PlanetMesh.create(asteroid.size, asteroid.color ?? "#77887e");
      const asteroidX = asteroid.orbital * 20;
      mesh.position.set(asteroidX, 0, 0);
      (mesh.userData as Record<symbol, string>)[ASTEROID_ID] = asteroid.asteroidId;
      this.group.add(mesh);
      this.navigationPoints.asteroid.set(asteroid.asteroidId, { x: asteroidX, y: 0, z: 0 });
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
