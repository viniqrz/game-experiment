import { Exception } from "../exception";
import { GameObject } from "../object";
import { Scene } from "../scene";

export class Camera {
  public scene?: Scene;

  constructor(
    private x = 0,
    private y = 0,
    private attachedObject: GameObject | null = null
  ) {}

  getAttachedObject() {
    return this.attachedObject;
  }

  setAttachedObject(obj: GameObject | null) {
    this.attachedObject = obj;
  }

  getX() {
    return this.x;
  }

  moveX(diff: number) {
    this.setX(this.x + diff);
  }

  setX(x: number) {
    if (x < 0 || x >= document.body.scrollWidth) return;
    this.x = x;
    window.scrollTo(this.x, this.y);
  }

  moveY(diff: number) {
    this.setY(this.y + diff);
  }

  getY() {
    return this.y;
  }

  setY(y: number) {
    if (y < 0 || y >= document.body.scrollHeight) return;
    this.y = y;
    window.scrollTo(this.x, this.y);
  }

  checkIfObjectIsInTheView(object: GameObject) {
    if (object.scene !== this.scene) {
      throw new Exception("Object should ");
    }

    const [objectX, objectY] = [object.getX(), object.getY()];
    const [cameraX, cameraY] = [this.x, this.y];
  }

  checkIfObjectIsBeforeXAxisCenter(object: GameObject) {
    const isBeforeCenter =
      object.getX() + object.getWidth() / 2 - this.x < window.innerWidth / 2;
    return isBeforeCenter;
  }

  checkIfObjectIsAfterXAxisCenter(object: GameObject) {
    const isAfterCenter =
      object.getX() + object.getWidth() / 2 - this.x > window.innerWidth / 2;
    return isAfterCenter;
  }

  checkIfObjectIsBeforeYAxisCenter(object: GameObject) {
    const isBeforeCenter =
      object.getY() + object.getHeight() / 2 - this.y < window.innerHeight / 2;
    return isBeforeCenter;
  }

  checkIfObjectIsAfterYAxisCenter(object: GameObject) {
    const isAfterCenter =
      object.getY() + object.getHeight() / 2 - this.y > window.innerHeight / 2;
    return isAfterCenter;
  }

  setXY(x: number, y: number) {
    this.setX(x);
    this.setY(y);
  }

  right(px = 1) {
    this.setX(this.x + px);
  }

  left(px = 1) {
    this.setX(this.x - px);
  }

  up(px = 1) {
    this.setY(this.y - px);
  }

  down(px = 1) {
    this.setY(this.y + px);
  }
}
