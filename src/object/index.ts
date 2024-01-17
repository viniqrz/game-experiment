import {
  ADControl,
  DragAndDropControl,
  FollowCursorOnClickControl,
  FollowCursorOnMoveControl,
  JumpYControl,
  WSADControl,
} from "../controls";
import { MouseEventsList } from "../events/mouse";
import { Scene } from "../scene";

export abstract class GameObject {
  scene: Scene;
  mouse: MouseEventsList;
  containerHtml: HTMLElement;
  textureHtml: HTMLElement;
  ID: string;
  x: number;
  y: number;
  z: number;
  collision: boolean;
  gravity: boolean;
  gravityIntensity: number;

  onXChange?: (diff: number) => void;
  onYChange?: (diff: number) => void;

  static GAME_OBJECT_CLASS_NAME = "game-object-container";

  constructor(scene: Scene, textureHtml: HTMLElement) {
    this.ID = Math.random().toString().slice(2);

    this.containerHtml = document.createElement("div");
    this.containerHtml.classList.add(GameObject.GAME_OBJECT_CLASS_NAME);
    this.containerHtml.appendChild(textureHtml);

    this.textureHtml = textureHtml;

    this.scene = scene;

    this.containerHtml.id = this.ID;
    this.containerHtml.style.position = "absolute";
    this.containerHtml.style.overflow = "hidden";
    this.containerHtml.draggable = false;

    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.mouse = new MouseEventsList(this.containerHtml);

    this.collision = false;

    this.gravity = false;
    this.gravityIntensity = 1;
  }

  checkIfHasCameraAttached() {
    return (
      this.scene.getCamera() &&
      this.scene.getCamera()!.getAttachedObject() &&
      this.scene.getCamera()!.getAttachedObject()!.ID === this.ID
    );
  }

  setContainerWidth(width: number) {
    this.containerHtml.style.width = `${width}px`;
  }

  getContainerWidth() {
    return this.containerHtml.getBoundingClientRect().width;
  }

  getDisplayWidth() {
    return this.containerHtml.getBoundingClientRect().width;
  }

  getWidth() {
    return (
      this.textureHtml.getBoundingClientRect().width ||
      Number(this.textureHtml.style.width.split("px")[0])
    );
  }

  setWidth(width: number) {
    this.textureHtml.style.width = `${width}px`;
  }

  getHeight() {
    return (
      this.textureHtml.getBoundingClientRect().height ||
      Number(this.textureHtml.style.height.split("px")[0])
    );
  }

  setHeight(height: number) {
    this.textureHtml.style.height = `${height}px`;
  }

  displayOnScene(initX = 0, initY = 0, initZ = 0) {
    this.scene.addObject(this);
    this.setXYZ(initX, initY, initZ);
  }

  getContainerHtml() {
    return this.containerHtml;
  }

  getTextureHtml() {
    return this.textureHtml;
  }

  notifyTextureChange() {}

  updateTextureHtml(textureHtml: HTMLElement) {
    this.containerHtml.innerHTML = textureHtml.outerHTML;
    this.textureHtml = textureHtml;
    this.notifyTextureChange();
  }

  getBoundaries() {
    const { left, right, top, bottom, width } =
      this.getContainerHtml().getBoundingClientRect();
    return {
      left,
      right,
      top,
      bottom,
    };
  }

  setCollision(val: boolean) {
    this.collision = val;
  }

  getCollision() {
    return this.collision;
  }

  setGravity(val: boolean) {
    this.gravity = val;
  }

  getGravity() {
    return this.gravity;
  }

  setGravityIntensity(val: number) {
    this.gravityIntensity = val;
  }

  getGravityIntensity() {
    return this.gravityIntensity;
  }

  setOnXChange(callback: (diff: number) => void) {
    this.onXChange = callback;
  }

  setOnYChange(callback: (diff: number) => void) {
    this.onYChange = callback;
  }

  getX() {
    return this.x;
  }

  setX(x: number) {
    const diff = x - this.x;
    const isPositive = diff > 0;
    const allowed = this.scene.requestXUpdate(this, isPositive);
    if (!allowed) return;

    this.x = x;

    this.getContainerHtml().style.left = `${x}px`;

    this.notifyXChange(diff);

    if (this.onXChange) this.onXChange(diff);
  }

  notifyXChange(diff: number) {
    this.scene.notifyXChange(this, diff);
  }

  getY() {
    return this.y;
  }

  setY(y: number) {
    const diff = y - this.y;
    const isPositive = diff > 0;
    const allowed = this.scene.requestYUpdate(this, isPositive);
    if (!allowed) return;

    this.y = y;

    this.getContainerHtml().style.top = `${y}px`;

    this.notifyYChange(diff);

    if (this.onXChange) this.onXChange(diff);
  }

  notifyYChange(diff: number) {
    this.scene.notifyYChange(this, diff);
  }

  setZ(z: number) {
    this.z = z;

    this.getContainerHtml().style.zIndex = z + "";
  }

  setXY(x: number, y: number) {
    this.setX(x);
    this.setY(y);
  }

  setXYZ(x: number, y: number, z: number) {
    this.setX(x);
    this.setY(y);
    this.setZ(z);
  }

  forward() {
    this.setZ(this.z + 1);
  }

  backward() {
    this.setZ(this.z - 1);
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

  requestJump() {
    return this.scene.requestJump(this);
  }
}

export abstract class ControllableGameObject extends GameObject {
  wsadControl: WSADControl;
  adControl: ADControl;
  jumpYControl: JumpYControl;
  dragAndDropControl: DragAndDropControl;
  followCursorOnMoveControl: FollowCursorOnMoveControl;
  followCursorOnClickControl: FollowCursorOnClickControl;

  constructor(scene: Scene, textureHtml: HTMLElement) {
    super(scene, textureHtml);

    this.wsadControl = new WSADControl(this);
    this.adControl = new ADControl(this);
    this.jumpYControl = new JumpYControl(this);
    this.dragAndDropControl = new DragAndDropControl(this);
    this.followCursorOnMoveControl = new FollowCursorOnMoveControl(this);
    this.followCursorOnClickControl = new FollowCursorOnClickControl(this);
  }

  getWsadControl() {
    return this.wsadControl;
  }

  getAdControl() {
    return this.adControl;
  }

  getJumpYControl() {
    return this.jumpYControl;
  }

  getFollowCursorOnMoveControl() {
    return this.followCursorOnMoveControl;
  }

  getFollowCursorOnClickControl() {
    return this.followCursorOnClickControl;
  }

  getDragAndDropControl() {
    return this.dragAndDropControl;
  }
}
