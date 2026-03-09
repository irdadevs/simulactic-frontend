import {
  Group,
  Intersection,
  AmbientLight,
  Object3D,
  PointLight,
  Vector3,
} from "three";
import { EventBridge } from "../core/EventBridge";
import { IRenderableScene } from "../core/SceneManager";
import { AsteroidType } from "../../types/asteroid.types";
import { PlanetBiome, PlanetType } from "../../types/planet.types";
import { StarType } from "../../types/star.types";
import { OrbitHelper } from "./OrbitHelper";
import { AsteroidMesh } from "./AsteroidMesh";
import { biomeBaseColor } from "./CelestialTextures";
import { PlanetMesh } from "./PlanetMesh";
import { StarVisualFactory } from "./StarVisualFactory";

const SYSTEM_ID = Symbol("systemId");
const STAR_ID = Symbol("starId");
const PLANET_ID = Symbol("planetId");
const MOON_ID = Symbol("moonId");
const ASTEROID_ID = Symbol("asteroidId");
const DEFAULT_MOON_COLOR = "#d7dee4";
const DEFAULT_ASTEROID_COLOR = "#8f6540";
const STAR_CLEARANCE = 4.5;
const ORBIT_CLEARANCE = 3.5;
const MOON_CLEARANCE = 1.4;

export class SystemScene implements IRenderableScene {
  readonly kind = "system" as const;
  readonly group = new Group();
  private data: {
    systemId: string;
    stars: Array<{
      starId: string;
      starType: StarType;
      isMain: boolean;
      orbital: number;
      size: number;
      color?: string;
    }>;
    planets: Array<{
      planetId: string;
      planetType: PlanetType;
      biome: PlanetBiome;
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
      type: AsteroidType;
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
  private readonly centerStarSizes: number[] = [];
  private mounted = false;

  constructor(eventBridge: EventBridge) {
    this.eventBridge = eventBridge;
  }

  mount(data: {
    systemId: string;
    stars: Array<{
      starId: string;
      starType: StarType;
      isMain: boolean;
      orbital: number;
      size: number;
      color?: string;
    }>;
    planets: Array<{
      planetId: string;
      planetType: PlanetType;
      biome: PlanetBiome;
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
      type: AsteroidType;
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

    const target = this.pickTarget(intersections);
    if (!target) return;

    if (target.kind === "star") {
      this.eventBridge.emit("starClicked", {
        starId: target.id,
        systemId: this.data.systemId,
        anchor: _pointer,
      });
      return;
    }

    if (target.kind === "planet") {
      this.eventBridge.emit("planetClicked", {
        planetId: target.id,
        systemId: this.data.systemId,
        anchor: _pointer,
      });
      return;
    }

    if (target.kind === "moon") {
      this.eventBridge.emit("moonClicked", {
        moonId: target.id,
        systemId: this.data.systemId,
        anchor: _pointer,
      });
      return;
    }

    if (target.kind === "asteroid") {
      this.eventBridge.emit("asteroidClicked", {
        asteroidId: target.id,
        systemId: this.data.systemId,
        anchor: _pointer,
      });
    }
  }

  onPointerMove(
    intersections: Intersection<Object3D>[],
    pointer: { x: number; y: number },
  ): void {
    if (intersections.length === 0) {
      this.eventBridge.emit("hoverCleared", undefined);
      return;
    }

    const target = this.pickTarget(intersections);
    if (!target) {
      this.eventBridge.emit("hoverCleared", undefined);
      return;
    }

    if (target.kind === "star") {
      this.eventBridge.emit("starHovered", {
        systemId: this.data.systemId,
        starId: target.id,
        anchor: pointer,
      });
      return;
    }

    if (target.kind === "planet") {
      this.eventBridge.emit("planetHovered", {
        systemId: this.data.systemId,
        planetId: target.id,
        anchor: pointer,
      });
      return;
    }

    if (target.kind === "moon") {
      this.eventBridge.emit("moonHovered", {
        systemId: this.data.systemId,
        moonId: target.id,
        anchor: pointer,
      });
      return;
    }

    if (target.kind === "asteroid") {
      this.eventBridge.emit("asteroidHovered", {
        systemId: this.data.systemId,
        asteroidId: target.id,
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
    this.centerStarSizes.length = 0;
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
    this.centerStarSizes.push(Math.max(mainStar.size, 0.8));

    this.data.stars.forEach((star, index) => {
      const isMainStar = star.starId === mainStar.starId;
      const starAnchor = isMainStar ? mainStarAnchor : new Group();

      if (!isMainStar) {
        const orbitPivot = new Group();
        orbitPivot.position.set(0, 0, 0);
        this.group.add(orbitPivot);

        const centerRadius = Math.max(this.centerStarSizes[0] ?? 0.8, 0.8);
        const orbitRadius = Math.max(16, star.orbital * 16, centerRadius + Math.max(star.size, 0.8) + STAR_CLEARANCE);
        starAnchor.position.set(orbitRadius, 0, 0);
        orbitPivot.add(starAnchor);
        this.starCenters.push(starAnchor);
        this.centerStarSizes.push(Math.max(star.size, 0.8));

        orbitPivot.rotation.y = index * 0.65;
        this.orbitAnimations.push({
          pivot: orbitPivot,
          speed: 0.08 + (index % 5) * 0.025,
        });
        this.group.add(OrbitHelper.create(orbitRadius, "#47524b", 128, "dashed"));
      }

      const starNode = StarVisualFactory.create({
        starId: star.starId,
        starType: star.starType,
        size: Math.max(star.size, 0.8),
        color: star.color,
        isMain: star.isMain,
      });
      (starNode.userData as Record<symbol, string>)[STAR_ID] = star.starId;
      (starNode.userData as Record<symbol, string>)[SYSTEM_ID] = this.data.systemId;
      starAnchor.add(starNode);
      this.navigationPoints.star.set(star.starId, starNode);
    });
  }

  private buildPlanets(): void {
    if (this.starCenters.length === 0) return;
    const occupiedRadii = new Array<number>(this.starCenters.length)
      .fill(0)
      .map((_, index) => Math.max(this.centerStarSizes[index] ?? 0.8, 0.8) + STAR_CLEARANCE);

    const sortedPlanets = [...this.data.planets].sort((left, right) => left.orbital - right.orbital);
    sortedPlanets.forEach((planet) => {
      const centerIndex = this.getCenterIndex(planet.planetId);
      const center = this.starCenters[centerIndex];
      const planetVisualRadius = Math.max(planet.size, 0.4);
      const radius = this.resolveOrbitRadius(
        this.toPlanetRadius(planet.orbital),
        occupiedRadii[centerIndex],
        planetVisualRadius,
        ORBIT_CLEARANCE,
      );
      occupiedRadii[centerIndex] = radius + planetVisualRadius;
      const orbitPivot = new Group();
      orbitPivot.position.set(0, 0, 0);
      center.add(orbitPivot);

      this.orbitAnimations.push({
        pivot: orbitPivot,
        speed: 0.2 + (centerIndex % 7) * 0.04,
      });

      const mesh = PlanetMesh.create(planet.size, planet.color ?? biomeBaseColor(planet.biome), {
        seed: planet.planetId,
        kind: "planet",
        biome: planet.biome,
        planetType: planet.planetType,
      });
      mesh.position.set(radius, 0, 0);
      (mesh.userData as Record<symbol, string>)[PLANET_ID] = planet.planetId;
      orbitPivot.add(mesh);
      this.navigationPoints.planet.set(planet.planetId, mesh);
      center.add(OrbitHelper.create(radius, "#5f6d65", 128, "continuous"));

      let moonOccupied = planetVisualRadius + MOON_CLEARANCE;
      (planet.moons ?? []).forEach((moon, index) => {
        const moonPivot = new Group();
        moonPivot.position.set(0, 0, 0);
        mesh.add(moonPivot);

        const moonVisualRadius = Math.max(moon.size, 0.18);
        const moonRadius = this.resolveOrbitRadius(
          moon.orbital * 2.2 + index * 0.65 + 1.8,
          moonOccupied,
          moonVisualRadius,
          MOON_CLEARANCE,
        );
        moonOccupied = moonRadius + moonVisualRadius;
        moonPivot.rotation.y = index * 0.85;
        this.orbitAnimations.push({
          pivot: moonPivot,
          speed: 0.45 + (index % 5) * 0.09,
        });

        const moonMesh = PlanetMesh.create(moon.size, moon.color ?? DEFAULT_MOON_COLOR, {
          seed: moon.moonId,
          kind: "moon",
        });
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
    const occupiedRadii = new Array<number>(this.starCenters.length)
      .fill(0)
      .map((_, index) => Math.max(this.centerStarSizes[index] ?? 0.8, 0.8) + STAR_CLEARANCE);
    this.data.planets.forEach((planet) => {
      const centerIndex = this.getCenterIndex(planet.planetId);
      const base = this.toPlanetRadius(planet.orbital);
      occupiedRadii[centerIndex] = Math.max(occupiedRadii[centerIndex], base + Math.max(planet.size, 0.4));
    });

    const sortedAsteroids = [...(this.data.asteroids ?? [])].sort((left, right) => left.orbital - right.orbital);
    sortedAsteroids.forEach((asteroid) => {
      const centerIndex = this.getCenterIndex(asteroid.asteroidId);
      const center = this.starCenters[centerIndex];
      const orbitPivot = new Group();
      orbitPivot.position.set(0, 0, 0);
      center.add(orbitPivot);
      this.orbitAnimations.push({
        pivot: orbitPivot,
        speed: 0.16 + (centerIndex % 9) * 0.03,
      });

      const asteroidVisualRadius = Math.max(asteroid.size, 0.42);
      const asteroidX = this.resolveOrbitRadius(
        this.toAsteroidRadius(asteroid.orbital),
        occupiedRadii[centerIndex],
        asteroidVisualRadius,
        ORBIT_CLEARANCE,
      );
      occupiedRadii[centerIndex] = asteroidX + asteroidVisualRadius;
      const renderNode =
        asteroid.type === "cluster"
          ? AsteroidMesh.createCluster(asteroid.size, asteroid.color ?? DEFAULT_ASTEROID_COLOR, asteroid.asteroidId)
          : AsteroidMesh.createSingle(asteroid.size, asteroid.color ?? DEFAULT_ASTEROID_COLOR, asteroid.asteroidId);
      renderNode.position.set(asteroidX, 0, 0);
      (renderNode.userData as Record<symbol, string>)[ASTEROID_ID] = asteroid.asteroidId;
      orbitPivot.add(renderNode);
      this.navigationPoints.asteroid.set(asteroid.asteroidId, renderNode);
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

  private resolveOrbitRadius(
    requestedRadius: number,
    occupiedRadius: number,
    visualRadius: number,
    clearance: number,
  ): number {
    return Math.max(requestedRadius, occupiedRadius + visualRadius + clearance);
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

  private pickTarget(
    intersections: Intersection<Object3D>[],
  ): { kind: "moon" | "planet" | "asteroid" | "star"; id: string } | null {
    // Prioritize smallest crowded targets first.
    const priority: Array<{ kind: "moon" | "planet" | "asteroid" | "star"; symbol: symbol }> = [
      { kind: "asteroid", symbol: ASTEROID_ID },
      { kind: "moon", symbol: MOON_ID },
      { kind: "planet", symbol: PLANET_ID },
      { kind: "star", symbol: STAR_ID },
    ];

    for (const { kind, symbol } of priority) {
      for (const entry of intersections) {
        const id = this.findTaggedId(entry.object, symbol);
        if (id) return { kind, id };
      }
    }

    return null;
  }
}
