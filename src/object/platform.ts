import { GameObject } from ".";
import { CameraEvent } from "../camera";
import { Exception } from "../exception";
import { Scene } from "../scene";

export class Platform {
  chunks: GameObject[] = [];
  private width = 0;
  private visibilityControlPadding = 256;

  constructor(public scene: Scene, public x = 0) {
    scene.getCamera().listen(CameraEvent.X_CHANGE, () => {
      this.controlChunksVisibility();
    });
    scene.getCamera().listen(CameraEvent.Y_CHANGE, () => {
      this.controlChunksVisibility();
    });
  }

  setVisibilityControlPadding(n: number) {
    this.visibilityControlPadding = n;
  }

  getVisibilityControlPadding() {
    return this.visibilityControlPadding;
  }

  controlChunksVisibility() {
    for (const chunk of this.getChunks()) {
      if (
        this.getScene()
          .getCamera()
          .checkIfObjectIsInTheView(chunk, this.getVisibilityControlPadding())
      ) {
        chunk.show();
      } else {
        chunk.hide();
      }
    }
  }

  getChunks() {
    return this.chunks;
  }

  getScene() {
    return this.scene;
  }

  addChunk(object: GameObject) {
    if (object.scene.ID !== this.scene.ID) {
      throw new Exception("Invalid scene");
    }
    if (!object.getWidth()) {
      throw new Exception("Object must have specified width");
    }
    if (!object.getHeight()) {
      throw new Exception("Object must have specified height");
    }
    this.chunks.push(object);

    object.displayOnScene(
      this.x + this.width,
      this.scene.getHeight() - object.getHeight(),
      0
    );
    object.setCollision(true);

    this.width += object.getWidth();
    if (this.width > this.scene.getWidth()) {
      this.scene.setWidth(this.width);
    }

    if (!this.scene.getCamera().checkIfObjectIsInTheView(object)) {
      object.hide();
    }
  }

  setX(x: number) {
    for (const chunk of this.chunks) {
      chunk.right(x - this.x);
    }
    this.x = x;
  }

  getX() {
    return this.x;
  }
}
