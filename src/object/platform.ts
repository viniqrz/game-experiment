import { GameObject } from ".";
import { Scene } from "../scene";

export class Platform {
  chunks: GameObject[] = [];
  private width = 0;

  constructor(public scene: Scene, public x = 0) {}

  addChunk(object: GameObject) {
    if (object.scene.ID !== this.scene.ID) {
      throw new Error("Invalid scene");
    }
    if (!object.getWidth()) {
      alert("Object must have specified width");
      throw new Error("Object must have specified width");
    }
    if (!object.getHeight()) {
      alert("Object must have specified height");
      throw new Error("Object must have specified height");
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
