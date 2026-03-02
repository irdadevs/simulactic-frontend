import { Clock, Color, Scene, WebGLRenderer } from "three";
import { Camera } from "three";

export class Renderer {
  readonly instance: WebGLRenderer;
  private readonly clock = new Clock();
  private animationId: number | null = null;
  private updateCallback: ((deltaSeconds: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.instance = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.setClearColor(new Color("#111312"));
  }

  resize(width: number, height: number): void {
    this.instance.setSize(width, height, false);
  }

  render(scene: Scene, camera: Camera): void {
    this.instance.render(scene, camera);
  }

  start(update: (deltaSeconds: number) => void): void {
    if (this.animationId != null) return;
    this.updateCallback = update;
    const frame = () => {
      this.animationId = window.requestAnimationFrame(frame);
      const deltaSeconds = this.clock.getDelta();
      this.updateCallback?.(deltaSeconds);
    };
    frame();
  }

  stop(): void {
    if (this.animationId == null) return;
    window.cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }

  dispose(): void {
    this.stop();
    this.instance.dispose();
  }
}
