import {
  Group,
  Intersection,
  Object3D,
  Raycaster,
  Scene,
  Vector3,
  Vector2,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CameraController, CameraMode } from "./CameraController";
import { EventBridge } from "./EventBridge";
import { Renderer } from "./Renderer";

export interface IRenderableScene {
  readonly kind: "galaxy" | "system";
  readonly group: Group;
  update(deltaSeconds: number): void;
  onPointerDown?(
    intersections: Intersection<Object3D>[],
    pointer: { x: number; y: number },
  ): void;
  onPointerMove?(
    intersections: Intersection<Object3D>[],
    pointer: { x: number; y: number },
  ): void;
  getNavigationPoint?(
    target: { kind: "star" | "planet" | "moon" | "asteroid"; id: string },
  ): { x: number; y: number; z: number } | null;
  getSystemPoint?(systemId: string): { x: number; y: number; z: number } | null;
  dispose(): void;
}

type ManagerInput = {
  canvas: HTMLCanvasElement;
  eventBridge: EventBridge;
};

export class SceneManager {
  readonly eventBridge: EventBridge;
  readonly scene: Scene;
  readonly renderer: Renderer;
  readonly cameraController: CameraController;
  readonly controls: OrbitControls;

  private activeScene: IRenderableScene | null = null;
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly canvas: HTMLCanvasElement;
  private focusedSystemId: string | null = null;
  private focusedPoint: Vector3 = new Vector3(0, 0, 0);
  private hasRequestedSystemView = false;
  private unsubscribeSystemClick: (() => void) | null = null;
  private unsubscribeSystemNavigation: (() => void) | null = null;
  private pointerHandler: ((event: PointerEvent) => void) | null = null;
  private pointerMoveHandler: ((event: PointerEvent) => void) | null = null;
  private pointerLeaveHandler: (() => void) | null = null;
  private pointerInsideCanvas = false;
  private pointerCanvasX = 0;
  private pointerCanvasY = 0;
  private navigationStartTime = 0;
  private readonly navigationDurationMs = 650;
  private readonly edgePanMarginPx = 48;
  private readonly edgePanBaseSpeed = 80;
  private simulationPlaying = true;
  private simulationSpeed: 0.5 | 1 | 2 = 1;
  private navigationFromCamera: Vector3 | null = null;
  private navigationToCamera: Vector3 | null = null;
  private navigationFromTarget: Vector3 | null = null;
  private navigationToTarget: Vector3 | null = null;
  private disposed = false;

  constructor(input: ManagerInput) {
    this.canvas = input.canvas;
    this.eventBridge = input.eventBridge;
    this.scene = new Scene();
    this.renderer = new Renderer(input.canvas);
    this.cameraController = new CameraController(this.getAspect(input.canvas));
    this.controls = new OrbitControls(this.cameraController.camera, input.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.09;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 0.95;
    this.controls.panSpeed = 0.8;
    this.controls.target.set(0, 0, 0);
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.setMode("galaxy");

    const controlsWithZoomToCursor = this.controls as OrbitControls & { zoomToCursor?: boolean };
    if (typeof controlsWithZoomToCursor.zoomToCursor === "boolean") {
      controlsWithZoomToCursor.zoomToCursor = true;
    }

    this.renderer.resize(input.canvas.clientWidth, input.canvas.clientHeight);
    this.bindPointer(input.canvas);
    this.unsubscribeSystemClick = this.eventBridge.on("systemClicked", ({ systemId, focusPoint }) => {
      this.focusedSystemId = systemId;
      this.focusedPoint.set(focusPoint.x, focusPoint.y, focusPoint.z);
      this.controls.target.copy(this.focusedPoint);
      this.hasRequestedSystemView = false;
      this.controls.update();
    });
    this.unsubscribeSystemNavigation = this.eventBridge.on("requestSystemNavigation", ({ target }) => {
      this.navigateToSystemTarget(target);
    });
    this.renderer.start((delta) => this.update(delta));
  }

  setMode(mode: CameraMode): void {
    this.cameraController.setMode(mode);
    if (mode === "galaxy") {
      this.controls.minDistance = 12;
      this.controls.maxDistance = 1800;
      this.controls.maxPolarAngle = Math.PI - 0.02;
    } else {
      this.controls.minDistance = 4;
      this.controls.maxDistance = 800;
      this.controls.maxPolarAngle = Math.PI - 0.02;
      this.focusedSystemId = null;
      this.hasRequestedSystemView = false;
      this.controls.target.set(0, 0, 0);
    }
    this.controls.update();
  }

  navigateToSystemTarget(target: { kind: "star" | "planet" | "moon" | "asteroid"; id: string }): void {
    if (this.activeScene?.kind !== "system") return;
    if (!this.activeScene.getNavigationPoint) return;

    const point = this.activeScene.getNavigationPoint(target);
    if (!point) return;

    const destinationTarget = new Vector3(point.x, point.y, point.z);
    const currentTarget = this.controls.target.clone();
    const currentCamera = this.cameraController.camera.position.clone();
    const offset = currentCamera.clone().sub(currentTarget);

    this.navigationFromTarget = currentTarget;
    this.navigationToTarget = destinationTarget;
    this.navigationFromCamera = currentCamera;
    this.navigationToCamera = destinationTarget.clone().add(offset);
    this.navigationStartTime = performance.now();
  }

  animateGalaxyReturnFocus(point: { x: number; y: number; z: number }): void {
    const destinationTarget = new Vector3(point.x, point.y, point.z);
    const currentTarget = this.controls.target.clone();
    const currentCamera = this.cameraController.camera.position.clone();
    const direction = currentCamera.clone().sub(currentTarget);
    if (direction.lengthSq() < 0.001) {
      direction.set(0, 0.2, 1);
    }
    direction.normalize();

    const distance = Math.max(currentCamera.distanceTo(currentTarget) * 1.8, 240);
    const destinationCamera = destinationTarget.clone().addScaledVector(direction, distance);
    destinationCamera.y = Math.max(destinationCamera.y, 90);

    this.navigationFromTarget = currentTarget;
    this.navigationToTarget = destinationTarget;
    this.navigationFromCamera = currentCamera;
    this.navigationToCamera = destinationCamera;
    this.navigationStartTime = performance.now();
  }

  setSystemTimeConfig(config: { isPlaying: boolean; speed: 0.5 | 1 | 2 }): void {
    this.simulationPlaying = config.isPlaying;
    this.simulationSpeed = config.speed;
  }

  showGalaxyScene(nextScene: IRenderableScene): void {
    if (nextScene.kind !== "galaxy") {
      throw new Error("showGalaxyScene expects a galaxy scene");
    }
    this.setMode("galaxy");
    this.mountScene(nextScene);
  }

  showSystemScene(nextScene: IRenderableScene): void {
    if (nextScene.kind !== "system") {
      throw new Error("showSystemScene expects a system scene");
    }
    this.setMode("system");
    this.mountScene(nextScene);
  }

  getActiveSceneKind(): IRenderableScene["kind"] | null {
    return this.activeScene?.kind ?? null;
  }

  mountScene(nextScene: IRenderableScene): void {
    if (this.disposed) return;

    this.unmountScene();
    this.activeScene = nextScene;
    this.scene.add(nextScene.group);
  }

  unmountScene(): void {
    if (!this.activeScene) return;
    this.scene.remove(this.activeScene.group);
    this.activeScene.dispose();
    this.activeScene = null;
  }

  resize(width: number, height: number): void {
    if (this.disposed) return;
    if (height <= 0 || width <= 0) return;
    this.renderer.resize(width, height);
    this.cameraController.resize(width / height);
  }

  private update(deltaSeconds: number): void {
    if (this.disposed) return;
    this.applyEdgePan(deltaSeconds);
    this.controls.update();
    this.stepNavigation();

    if (this.activeScene?.kind === "galaxy" && this.focusedSystemId && !this.hasRequestedSystemView) {
      const distance = this.cameraController.camera.position.distanceTo(this.focusedPoint);
      if (distance <= 48) {
        this.hasRequestedSystemView = true;
        this.eventBridge.emit("requestSystemView", { systemId: this.focusedSystemId });
      }
    }

    const sceneDelta = this.simulationPlaying ? deltaSeconds * this.simulationSpeed : 0;
    this.activeScene?.update(sceneDelta);
    this.renderer.render(this.scene, this.cameraController.camera);
  }

  private bindPointer(canvas: HTMLCanvasElement): void {
    const getRaycastResult = (
      event: PointerEvent,
    ): { intersections: Intersection<Object3D>[]; pointer: { x: number; y: number } } => {
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      this.pointer.x = (x / bounds.width) * 2 - 1;
      this.pointer.y = -(y / bounds.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.cameraController.camera);
      return {
        intersections: this.raycaster.intersectObjects(this.activeScene?.group.children ?? [], true),
        pointer: { x, y },
      };
    };

    this.pointerHandler = (event: PointerEvent) => {
      if (this.disposed) return;
      if (!this.activeScene || !this.activeScene.onPointerDown) return;
      const raycast = getRaycastResult(event);
      this.activeScene.onPointerDown(raycast.intersections, raycast.pointer);
    };

    this.pointerMoveHandler = (event: PointerEvent) => {
      if (this.disposed) return;
      const bounds = canvas.getBoundingClientRect();
      this.pointerInsideCanvas = true;
      this.pointerCanvasX = event.clientX - bounds.left;
      this.pointerCanvasY = event.clientY - bounds.top;
      if (!this.activeScene || !this.activeScene.onPointerMove) return;
      const raycast = getRaycastResult(event);
      this.activeScene.onPointerMove(raycast.intersections, raycast.pointer);
    };

    this.pointerLeaveHandler = () => {
      this.pointerInsideCanvas = false;
    };

    canvas.addEventListener("pointerdown", this.pointerHandler);
    canvas.addEventListener("pointermove", this.pointerMoveHandler);
    canvas.addEventListener("pointerleave", this.pointerLeaveHandler);
  }

  private getAspect(canvas: HTMLCanvasElement): number {
    const width = Math.max(canvas.clientWidth, 1);
    const height = Math.max(canvas.clientHeight, 1);
    return width / height;
  }

  private stepNavigation(): void {
    if (
      !this.navigationFromCamera ||
      !this.navigationToCamera ||
      !this.navigationFromTarget ||
      !this.navigationToTarget
    ) {
      return;
    }

    const elapsed = performance.now() - this.navigationStartTime;
    const t = Math.min(1, elapsed / this.navigationDurationMs);
    const eased = 1 - Math.pow(1 - t, 3);

    this.cameraController.camera.position.lerpVectors(
      this.navigationFromCamera,
      this.navigationToCamera,
      eased,
    );
    this.controls.target.lerpVectors(this.navigationFromTarget, this.navigationToTarget, eased);

    if (t >= 1) {
      this.navigationFromCamera = null;
      this.navigationToCamera = null;
      this.navigationFromTarget = null;
      this.navigationToTarget = null;
    }
  }

  private applyEdgePan(deltaSeconds: number): void {
    if (!this.pointerInsideCanvas) return;
    if (this.navigationFromCamera || this.navigationToCamera) return;

    const width = Math.max(this.canvas.clientWidth, 1);
    const height = Math.max(this.canvas.clientHeight, 1);

    let horizontal = 0;
    if (this.pointerCanvasX <= this.edgePanMarginPx) {
      horizontal = -(1 - this.pointerCanvasX / this.edgePanMarginPx);
    } else if (this.pointerCanvasX >= width - this.edgePanMarginPx) {
      horizontal = (this.pointerCanvasX - (width - this.edgePanMarginPx)) / this.edgePanMarginPx;
    }

    let vertical = 0;
    if (this.pointerCanvasY <= this.edgePanMarginPx) {
      vertical = 1 - this.pointerCanvasY / this.edgePanMarginPx;
    } else if (this.pointerCanvasY >= height - this.edgePanMarginPx) {
      vertical = -((this.pointerCanvasY - (height - this.edgePanMarginPx)) / this.edgePanMarginPx);
    }

    if (horizontal === 0 && vertical === 0) return;

    const camera = this.cameraController.camera;
    const forward = this.controls.target.clone().sub(camera.position);
    forward.y = 0;
    if (forward.lengthSq() < 0.0001) {
      forward.set(0, 0, -1);
    } else {
      forward.normalize();
    }

    const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();
    const move = new Vector3();
    move.addScaledVector(right, horizontal);
    move.addScaledVector(forward, vertical);
    if (move.lengthSq() < 0.0001) return;
    move.normalize();

    const distanceScale = Math.max(18, camera.position.distanceTo(this.controls.target) * 0.26);
    const reverseBoost = vertical < 0 ? 1.35 : 1;
    const speed = this.edgePanBaseSpeed * distanceScale * reverseBoost;
    move.multiplyScalar(speed * deltaSeconds * 0.01);

    camera.position.add(move);
    this.controls.target.add(move);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.pointerHandler) {
      this.canvas.removeEventListener("pointerdown", this.pointerHandler);
      this.pointerHandler = null;
    }
    if (this.pointerMoveHandler) {
      this.canvas.removeEventListener("pointermove", this.pointerMoveHandler);
      this.pointerMoveHandler = null;
    }
    if (this.pointerLeaveHandler) {
      this.canvas.removeEventListener("pointerleave", this.pointerLeaveHandler);
      this.pointerLeaveHandler = null;
    }
    this.unsubscribeSystemClick?.();
    this.unsubscribeSystemClick = null;
    this.unsubscribeSystemNavigation?.();
    this.unsubscribeSystemNavigation = null;
    this.controls.dispose();
    this.unmountScene();
    this.renderer.dispose();
    this.eventBridge.clear();
  }
}
