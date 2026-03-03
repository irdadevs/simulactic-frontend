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
  onPointerDown?(intersections: Intersection<Object3D>[]): void;
  onPointerMove?(intersections: Intersection<Object3D>[]): void;
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
  private pointerHandler: ((event: PointerEvent) => void) | null = null;
  private pointerMoveHandler: ((event: PointerEvent) => void) | null = null;
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
    this.controls.update();

    if (this.activeScene?.kind === "galaxy" && this.focusedSystemId && !this.hasRequestedSystemView) {
      const distance = this.cameraController.camera.position.distanceTo(this.focusedPoint);
      if (distance <= 48) {
        this.hasRequestedSystemView = true;
        this.eventBridge.emit("requestSystemView", { systemId: this.focusedSystemId });
      }
    }

    this.activeScene?.update(deltaSeconds);
    this.renderer.render(this.scene, this.cameraController.camera);
  }

  private bindPointer(canvas: HTMLCanvasElement): void {
    const getIntersections = (event: PointerEvent): Intersection<Object3D>[] => {
      const bounds = canvas.getBoundingClientRect();
      this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.cameraController.camera);
      return this.raycaster.intersectObjects(this.activeScene?.group.children ?? [], true);
    };

    this.pointerHandler = (event: PointerEvent) => {
      if (this.disposed) return;
      if (!this.activeScene || !this.activeScene.onPointerDown) return;
      const intersections = getIntersections(event);
      this.activeScene.onPointerDown(intersections);
    };

    this.pointerMoveHandler = (event: PointerEvent) => {
      if (this.disposed) return;
      if (!this.activeScene || !this.activeScene.onPointerMove) return;
      const intersections = getIntersections(event);
      this.activeScene.onPointerMove(intersections);
    };

    canvas.addEventListener("pointerdown", this.pointerHandler);
    canvas.addEventListener("pointermove", this.pointerMoveHandler);
  }

  private getAspect(canvas: HTMLCanvasElement): number {
    const width = Math.max(canvas.clientWidth, 1);
    const height = Math.max(canvas.clientHeight, 1);
    return width / height;
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
    this.unsubscribeSystemClick?.();
    this.unsubscribeSystemClick = null;
    this.controls.dispose();
    this.unmountScene();
    this.renderer.dispose();
    this.eventBridge.clear();
  }
}
