import { Exception } from "../exception";
import { GameObject } from "../object";

export class Camera {
  ID: string;

  constructor(
    private x = 0,
    private y = 0,
    private attachedObject: GameObject | null = null
  ) {
    this.ID = Math.random().toString().slice(2);
  }

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
    if (this.ID !== object.getScene().getCamera().ID) {
      throw new Exception(`Object's camera is not this camera`);
    }

    const rangeX = [this.x, this.x + window.innerWidth];
    const rangeY = [this.y, this.y + window.innerHeight];

    const withinRange =
      object.getX() >= rangeX[0] &&
      object.getX() + object.getWidth() <= rangeX[1] &&
      object.getY() >= rangeY[0] &&
      object.getY() + object.getHeight() <= rangeY[1];

    return withinRange;
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
