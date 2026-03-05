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
  Vector3,
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
    star: new Map<string, Object3D>(),
    planet: new Map<string, Object3D>(),
    moon: new Map<string, Object3D>(),
    asteroid: new Map<string, Object3D>(),
  };
  private readonly orbitAnimations: Array<{
    pivot: Group;
    speed: number;
  }> = [];
  private readonly starCenters: Group[] = [];
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

  update(deltaSeconds: number): void {
    this.orbitAnimations.forEach((animation) => {
      animation.pivot.rotateY(animation.speed * deltaSeconds);
    });
  }

  onPointerDown(intersections: Intersection<Object3D>[], _pointer: { x: number; y: number }): void {
    if (intersections.length === 0) {
      this.eventBridge.emit("backgroundClicked", undefined);
      return;
    }

    const hit = intersections[0].object;
    const starId = this.findStarId(hit);
    if (starId) {
      this.eventBridge.emit("starClicked", {
        starId,
        systemId: this.data.systemId,
        anchor: _pointer,
      });
      return;
    }

    const planetId = this.findTaggedId(hit, PLANET_ID);
    if (planetId) {
      this.eventBridge.emit("planetClicked", {
        planetId,
        systemId: this.data.systemId,
        anchor: _pointer,
      });
      return;
    }

    const moonId = this.findTaggedId(hit, MOON_ID);
    if (moonId) {
      this.eventBridge.emit("moonClicked", {
        moonId,
        systemId: this.data.systemId,
        anchor: _pointer,
      });
      return;
    }

    const asteroidId = this.findTaggedId(hit, ASTEROID_ID);
    if (!asteroidId) return;

    this.eventBridge.emit("asteroidClicked", {
      asteroidId,
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
    this.orbitAnimations.length = 0;
    this.starCenters.length = 0;
  }

  getNavigationPoint(
    target: { kind: "star" | "planet" | "moon" | "asteroid"; id: string },
  ): { x: number; y: number; z: number } | null {
    const targetObject = this.navigationPoints[target.kind].get(target.id);
    if (!targetObject) return null;
    const world = targetObject.getWorldPosition(new Vector3());
    return { x: world.x, y: world.y, z: world.z };
  }

  private buildLighting(): void {
    const ambient = new AmbientLight("#9fb2ff", 0.45);
    this.group.add(ambient);

    const mainLight = new PointLight("#f8ffe5", 1.8, 2200, 2);
    mainLight.position.set(0, 0, 0);
    this.group.add(mainLight);
  }

  private buildStars(): void {
    const mainStar = this.data.stars.find((star) => star.isMain) ?? this.data.stars[0];
    if (!mainStar) return;

    const mainStarAnchor = new Group();
    mainStarAnchor.position.set(0, 0, 0);
    this.group.add(mainStarAnchor);
    this.starCenters.push(mainStarAnchor);

    this.data.stars.forEach((star, index) => {
      const isMainStar = star.starId === mainStar.starId;
      const starAnchor = isMainStar ? mainStarAnchor : new Group();

      if (!isMainStar) {
        const orbitPivot = new Group();
        orbitPivot.position.set(0, 0, 0);
        this.group.add(orbitPivot);

        const orbitRadius = Math.max(16, star.orbital * 16);
        starAnchor.position.set(orbitRadius, 0, 0);
        orbitPivot.add(starAnchor);
        this.starCenters.push(starAnchor);

        orbitPivot.rotation.y = index * 0.65;
        this.orbitAnimations.push({
          pivot: orbitPivot,
          speed: 0.08 + (index % 5) * 0.025,
        });
        this.group.add(OrbitHelper.create(orbitRadius, "#47524b", 128, "dashed"));
      }

      const mesh = new Mesh(
        new SphereGeometry(Math.max(star.size, 0.8), 20, 20),
        new MeshStandardMaterial({
          color: new Color(star.color ?? (star.isMain ? "#f8ffe5" : "#ffffff")),
          emissive: new Color(star.color ?? "#f8ffe5"),
          emissiveIntensity: star.isMain ? 0.7 : 0.35,
          roughness: 0.4,
        }),
      );

      mesh.position.set(0, 0, 0);
      (mesh.userData as Record<symbol, string>)[STAR_ID] = star.starId;
      (mesh.userData as Record<symbol, string>)[SYSTEM_ID] = this.data.systemId;
      starAnchor.add(mesh);
      this.navigationPoints.star.set(star.starId, mesh);
    });
  }

  private buildPlanets(): void {
    if (this.starCenters.length === 0) return;

    this.data.planets.forEach((planet) => {
      const center = this.starCenters[this.getCenterIndex(planet.planetId)];
      const radius = this.toPlanetRadius(planet.orbital);
      const orbitPivot = new Group();
      orbitPivot.position.set(0, 0, 0);
      center.add(orbitPivot);

      this.orbitAnimations.push({
        pivot: orbitPivot,
        speed: 0.2 + (this.getCenterIndex(planet.planetId) % 7) * 0.04,
      });

      const mesh = PlanetMesh.create(planet.size, planet.color ?? "#0da1bf");
      mesh.position.set(radius, 0, 0);
      (mesh.userData as Record<symbol, string>)[PLANET_ID] = planet.planetId;
      orbitPivot.add(mesh);
      this.navigationPoints.planet.set(planet.planetId, mesh);
      center.add(OrbitHelper.create(radius, "#5f6d65", 128, "continuous"));

      (planet.moons ?? []).forEach((moon, index) => {
        const moonPivot = new Group();
        moonPivot.position.set(0, 0, 0);
        mesh.add(moonPivot);

        const moonRadius = moon.orbital * 2.2 + index * 0.65 + 1.8;
        moonPivot.rotation.y = index * 0.85;
        this.orbitAnimations.push({
          pivot: moonPivot,
          speed: 0.45 + (index % 5) * 0.09,
        });

        const moonMesh = PlanetMesh.create(moon.size, moon.color ?? "#c8d0cb");
        moonMesh.position.set(moonRadius, 0, 0);
        (moonMesh.userData as Record<symbol, string>)[MOON_ID] = moon.moonId;
        moonPivot.add(moonMesh);
        this.navigationPoints.moon.set(moon.moonId, moonMesh);

        const moonOrbit = OrbitHelper.create(moonRadius, "#9ea8c2", 96, "dotted");
        moonOrbit.position.set(0, 0.5 + index * 0.05, 0);
        moonPivot.add(moonOrbit);
      });
    });
  }

  private buildAsteroids(): void {
    if (this.starCenters.length === 0) return;

    (this.data.asteroids ?? []).forEach((asteroid) => {
      const center = this.starCenters[this.getCenterIndex(asteroid.asteroidId)];
      const orbitPivot = new Group();
      orbitPivot.position.set(0, 0, 0);
      center.add(orbitPivot);
      this.orbitAnimations.push({
        pivot: orbitPivot,
        speed: 0.16 + (this.getCenterIndex(asteroid.asteroidId) % 9) * 0.03,
      });

      const mesh = PlanetMesh.create(asteroid.size, asteroid.color ?? "#77887e");
      const asteroidX = this.toAsteroidRadius(asteroid.orbital);
      mesh.position.set(asteroidX, 0, 0);
      (mesh.userData as Record<symbol, string>)[ASTEROID_ID] = asteroid.asteroidId;
      orbitPivot.add(mesh);
      this.navigationPoints.asteroid.set(asteroid.asteroidId, mesh);
      center.add(OrbitHelper.create(asteroidX, "#7d8e89", 128, "dotted"));
    });
  }

  private toPlanetRadius(orbital: number): number {
    return Math.max(1, Math.round(orbital)) * 20;
  }

  private toAsteroidRadius(orbital: number): number {
    const stepped = Math.max(0.5, Math.round(orbital * 2) / 2);
    return stepped * 20;
  }

  private getCenterIndex(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
      hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    return hash % Math.max(this.starCenters.length, 1);
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
