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

export enum GameObjectEvent {
  X_CHANGE = "x_change",
  Y_CHANGE = "y_change",
  LEAVE_SCENE = "leave_scene",
  LEAVE_SCENE_TOP = "leave_scene_top",
  LEAVE_SCENE_BOTTOM = "leave_scene_bottom",
  LEAVE_SCENE_RIGHT = "leave_scene_right",
  LEAVE_SCENE_LEFT = "leave_scene_left",
  COLLISION = "collision",
  COLLISION_TOP = "collision_top",
  COLLISION_BOTTOM = "collision_bottom",
  COLLISION_RIGHT = "collision_right",
  COLLISION_LEFT = "collision_left",
}

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
  speed: number;
  gravity: boolean;
  gravityIntensity: number;

  listeners: Map<GameObjectEvent, Array<Function>> = new Map();

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
    this.speed = 1;
  }

  emit(event: GameObjectEvent, payload: any) {
    if (!this.listeners.has(event)) return;

    for (const callback of this.listeners.get(event)!) {
      callback(payload);
    }
  }

  listen(event: GameObjectEvent, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)!.push(callback);
  }

  setSpeed(speed: number) {
    this.speed = speed;
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

  getX() {
    return this.x;
  }

  setX(x: number): boolean {
    const diff = x - this.x;
    const isPositive = diff > 0;
    const allowed = this.scene.requestXUpdate(this, isPositive);
    if (!allowed) return false;

    this.x = x;

    this.getContainerHtml().style.left = `${x}px`;

    this.scene.notifyXChange(this, diff);

    this.emit(GameObjectEvent.X_CHANGE, diff);

    return true;
  }

  getY() {
    return this.y;
  }

  setY(y: number): boolean {
    const diff = y - this.y;
    const isPositive = diff > 0;
    const allowed = this.scene.requestYUpdate(this, isPositive);
    if (!allowed) return false;

    this.y = y;

    this.getContainerHtml().style.top = `${y}px`;

    this.scene.notifyYChange(this, diff);

    this.emit(GameObjectEvent.Y_CHANGE, diff);

    return true;
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
    this.setX(this.x + px * this.speed);
  }

  left(px = 1) {
    this.setX(this.x - px * this.speed);
  }

  up(px = 1) {
    this.setY(this.y - px);
  }

  down(px = 1) {
    return this.setY(this.y + px);
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
