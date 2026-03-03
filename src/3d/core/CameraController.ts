import { PerspectiveCamera, Vector3 } from "three";

export type CameraMode = "galaxy" | "system";

export class CameraController {
  readonly camera: PerspectiveCamera;

  constructor(aspect: number) {
    this.camera = new PerspectiveCamera(60, aspect, 0.1, 10000);
    this.setMode("galaxy");
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  setMode(mode: CameraMode): void {
    if (mode === "galaxy") {
      this.camera.position.set(0, 120, 300);
      this.camera.lookAt(new Vector3(0, 0, 0));
      return;
    }

    this.camera.position.set(0, 45, 120);
    this.camera.lookAt(new Vector3(0, 0, 0));
  }
}
