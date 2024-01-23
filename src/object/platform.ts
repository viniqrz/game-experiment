import { GameObject } from ".";
import { CameraEvent } from "../camera";
import { Exception } from "../exception";
import { Scene } from "../scene";

export class Platform {
  chunks: GameObject[] = [];
  private width = 0;
  private visibilityLimitPaddingX = 256;
  private visibilityLimitPaddingY = 256;
  private shouldLimitVisibility = true;

  constructor(public scene: Scene, public x = 0) {
    scene.getCamera().listen(CameraEvent.X_CHANGE, () => {
      this.limitChunksVisibility();
    });
    scene.getCamera().listen(CameraEvent.Y_CHANGE, () => {
      this.limitChunksVisibility();
    });
  }

  setShouldLimitVisibility(b: boolean) {
    this.shouldLimitVisibility = b;
  }

  getShouldLimitVisibility() {
    return this.shouldLimitVisibility;
  }

  setvisibilityLimitPaddingX(n: number) {
    this.visibilityLimitPaddingX = n;
  }

  getvisibilityLimitPaddingX() {
    return this.visibilityLimitPaddingX;
  }

  setvisibilityLimitPaddingY(n: number) {
    this.visibilityLimitPaddingY = n;
  }

  getvisibilityLimitPaddingY() {
    return this.visibilityLimitPaddingY;
  }

  limitChunksVisibility() {
    if (!this.shouldLimitVisibility) return;
    for (const chunk of this.getChunks()) {
      if (
        this.getScene()
          .getCamera()
          .checkIfObjectIsInTheView(
            chunk,
            this.getvisibilityLimitPaddingX(),
            this.getvisibilityLimitPaddingY()
          )
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
    if (!this.scene.getHeight()) {
      throw new Exception("Scene must have specified height");
    }
    if (!this.scene.getWidth()) {
      throw new Exception("Scene must have specified width");
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

    if (
      this.shouldLimitVisibility &&
      !this.scene
        .getCamera()
        .checkIfObjectIsInTheView(
          object,
          this.getvisibilityLimitPaddingX(),
          this.getvisibilityLimitPaddingY()
        )
    ) {
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
