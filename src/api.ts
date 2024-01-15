import { KeyboardEventsList } from "./events/keyboard";
import { MouseEventsList } from "./events/mouse";

import {
  WSADControl,
  ADControl,
  JumpYControl,
  FollowCursorOnMoveControl,
  FollowCursorOnClickControl,
  DragAndDropControl,
  ControlEventListener,
  ControlEvent,
  StatusActiveControlEvent,
  StatusInactiveControlEvent,
} from "./controls";

const main = document.getElementById("main");

export class GameScreen {
  width = window.innerWidth;
  height = window.innerHeight;

  html = GameScreen.GenerateHtml();
  scene?: Scene;

  constructor() {
    //@ts-ignore
    if (window.gameScreen) return window.gameScreen;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    main!.innerHTML = "";
    main!.appendChild(this.html);

    //@ts-ignore
    window.gameScreen = this;
  }

  static GenerateHtml() {
    const html = document.createElement("div");
    html.classList.add("screen");
    return html;
  }

  getScreenSize() {
    return { width: this.width, height: this.height };
  }

  setActiveScene(scene: Scene) {
    this.scene = scene;
    this.html.innerHTML = "";
    this.html.appendChild(this.scene.getHtml());
  }
}

export class Camera {
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

export class Scene {
  objects: GameObject[];
  html: HTMLElement;
  mouse: MouseEventsList;
  keyboard: KeyboardEventsList;
  camera: Camera | null;
  closedBorders: boolean;
  gravitySpam: Spam;

  constructor() {
    this.objects = [];

    this.html = document.createElement("div");
    this.html.classList.add("scene");
    this.html.style.overflow = "hidden";

    this.mouse = new MouseEventsList(window);

    //@ts-ignore
    this.keyboard = new KeyboardEventsList(window);

    document.addEventListener("contextmenu", (event) => event.preventDefault());
    window.addEventListener("keydown", function (e) {
      if (e.key == " " && e.target == document.body) {
        e.preventDefault();
      }
    });

    this.setWidth(window.innerWidth);

    this.gravitySpam = new Spam(() => {
      this.ensureGravity();
    }, 3);
    this.gravitySpam.start();

    this.camera = null;
    this.closedBorders = true;
  }

  getClosedBorders() {
    return this.closedBorders;
  }

  setClosedBorders(val: boolean) {
    this.closedBorders = val;
  }

  setCamera(camera: Camera) {
    this.camera = camera;
  }

  getCamera() {
    return this.camera;
  }

  setWidth(width: number) {
    this.html.style.width = `${width}px`;
  }

  getWidth() {
    return this.html.getBoundingClientRect().width;
  }

  getHeight() {
    return this.html.getBoundingClientRect().height;
  }

  setHeight(height: number) {
    this.html.style.height = `${height}px`;
  }

  setBackgroundImage(
    url: string,
    options: {
      repeat: string;
      size: string;
      attachment: string;
    }
  ) {
    this.setBackground(`url("${url}")`, options);
  }

  setBackground(
    background: string,
    options = {
      repeat: "repeat",
      size: "contain",
      attachment: "fixed",
    }
  ) {
    options = {
      ...{
        repeat: "repeat",
        size: "contain",
        attachment: "fixed",
      },
      ...options,
    };
    this.html.style.background = background;
    this.html.style.backgroundRepeat = options.repeat;
    this.html.style.backgroundSize = options.size;
    this.html.style.backgroundAttachment = options.attachment;
  }

  getBackground(background: string) {
    return this.html.style.background;
  }

  setBackgroundColor(color: string) {
    this.html.style.backgroundColor = color;
  }

  getBackgroundColor() {
    return this.html.style.backgroundColor;
  }

  addObject(gameObject: GameObject) {
    this.objects.push(gameObject);
    this.html.appendChild(gameObject.getContainerHtml());
  }

  getHtml() {
    return this.html;
  }

  getObjects() {
    return this.objects;
  }

  checkIfThereIsYAxisOverlap(objectA: GameObject, objectB: GameObject) {
    const boundariesA = objectA.getBoundaries();
    const boundariesB = objectB.getBoundaries();

    const hasYUpperOverlap =
      (boundariesA.top < boundariesB.bottom &&
        boundariesA.bottom > boundariesB.bottom) ||
      boundariesA.top === boundariesB.top;

    const hasYLowerOverlap =
      (boundariesA.bottom > boundariesB.top &&
        boundariesA.top < boundariesB.top) ||
      boundariesA.bottom === boundariesB.bottom;

    return hasYUpperOverlap || hasYLowerOverlap;
  }

  checkIfThereIsXAxisOverlap(objectA: GameObject, objectB: GameObject) {
    const boundariesA = objectA.getBoundaries();
    const boundariesB = objectB.getBoundaries();

    const hasXLeftOverlap =
      (boundariesA.left < boundariesB.right &&
        boundariesA.right > boundariesB.right) ||
      boundariesA.left === boundariesB.left;

    if (hasXLeftOverlap) return true;

    const hasXRightOverlap =
      (boundariesA.right > boundariesB.left &&
        boundariesA.left < boundariesB.left) ||
      boundariesA.right === boundariesB.right;

    if (hasXRightOverlap) return true;

    const hasXInnerOverlap =
      boundariesA.left < boundariesB.right &&
      boundariesA.right < boundariesB.right &&
      boundariesA.right >= boundariesB.left;

    return hasXInnerOverlap;
  }

  requestXUpdate(actor: GameObject, isPositive: boolean) {
    return this.requestCoordinateUpdate(actor, isPositive, "X");
  }
  requestYUpdate(actor: GameObject, isPositive: boolean) {
    return this.requestCoordinateUpdate(actor, isPositive, "Y");
  }

  getBoundaries() {
    return {
      left: 0,
      right: this.getWidth(),
      top: 0,
      bottom: this.getHeight(),
    };
  }

  requestCoordinateUpdate(
    actor: GameObject,
    isPositive: boolean,
    type: "X" | "Y"
  ) {
    if (this.closedBorders) {
      const sceneBoundaries = this.getBoundaries();

      if (type === "X") {
        if (isPositive) {
          if (actor.getX() + actor.getWidth() > sceneBoundaries.right)
            return false;
        } else {
          if (actor.getX() < sceneBoundaries.left) return false;
        }
      }

      if (type === "Y") {
        if (isPositive) {
          if (actor.getY() + actor.getHeight() > sceneBoundaries.bottom)
            return false;
        } else {
          if (actor.getY() < sceneBoundaries.top) return false;
        }
      }
    }

    if (!actor.collision) return true;

    const objects = this.getObjects();

    for (const object of objects) {
      if (object.ID === actor.ID) continue;
      if (!object.collision) continue;
      if (object.z !== actor.z) continue;

      const actorBoundaries = actor.getBoundaries();
      const objectBoundaries = object.getBoundaries();

      if (type === "X") {
        const isThereYAxisOverlap = this.checkIfThereIsYAxisOverlap(
          actor,
          object
        );
        if (!isThereYAxisOverlap) continue;

        if (isPositive) {
          if (actorBoundaries.left > objectBoundaries.left) continue;
          if (actorBoundaries.right < objectBoundaries.left) continue;

          return false;
        } else {
          if (actorBoundaries.right < objectBoundaries.right) continue;
          if (actorBoundaries.left > objectBoundaries.right) continue;

          return false;
        }
      }

      if (type === "Y") {
        const isThereXAxisOverlap = this.checkIfThereIsXAxisOverlap(
          actor,
          object
        );
        if (!isThereXAxisOverlap) continue;

        if (isPositive) {
          if (actorBoundaries.top > objectBoundaries.top) continue;
          if (actorBoundaries.bottom < objectBoundaries.top) continue;

          return false;
        } else {
          if (actorBoundaries.bottom < objectBoundaries.bottom) continue;
          if (actorBoundaries.top > objectBoundaries.bottom) continue;

          return false;
        }
      }
    }

    return true;
  }

  ensureGravity() {
    const objects = this.getObjects();

    for (const object of objects) {
      if (object.getGravity()) {
        object.down(object.gravityIntensity);
      }
    }
  }

  findObjectBelowWithinRange(actor: GameObject, range = 0) {
    const objects = this.getObjects();

    for (const object of objects) {
      if (object.ID === actor.ID) continue;
      if (!object.collision) continue;
      if (object.z !== actor.z) continue;

      const actorBoundaries = actor.getBoundaries();
      const objectBoundaries = object.getBoundaries();

      const isThereXAxisOverlap = this.checkIfThereIsXAxisOverlap(
        actor,
        object
      );
      if (!isThereXAxisOverlap) continue;

      if (actorBoundaries.top > objectBoundaries.top) continue;
      if (actorBoundaries.bottom + range < objectBoundaries.top) continue;

      return object;
    }

    return null;
  }

  requestJump(actor: GameObject) {
    const objectBelow = this.findObjectBelowWithinRange(actor);
    return Boolean(objectBelow);
  }

  notifyXChange(actor: GameObject, diff: number) {
    this.moveAttachedCameraX(actor, diff);
  }

  moveAttachedCameraX(actor: GameObject, diff: number) {
    if (!actor.checkIfHasCameraAttached()) return;

    if (diff > 0 && this.getCamera()!.checkIfObjectIsBeforeXAxisCenter(actor))
      return;
    if (diff < 0 && this.getCamera()!.checkIfObjectIsAfterXAxisCenter(actor))
      return;

    this.getCamera()!.moveX(diff);
  }

  notifyYChange(actor: GameObject, diff: number) {
    this.moveAttachedCameraY(actor, diff);
  }

  moveAttachedCameraY(actor: GameObject, diff: number) {
    if (!actor.checkIfHasCameraAttached()) return;

    if (diff > 0 && this.getCamera()!.checkIfObjectIsBeforeYAxisCenter(actor))
      return;
    if (diff < 0 && this.getCamera()!.checkIfObjectIsAfterYAxisCenter(actor))
      return;

    this.getCamera()!.moveY(diff);
  }
}

export class GameObject {
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
  wsadControl: WSADControl;
  adControl: ADControl;
  jumpYControl: JumpYControl;
  dragAndDropControl: DragAndDropControl;
  followCursorOnMoveControl: FollowCursorOnMoveControl;
  followCursorOnClickControl: FollowCursorOnClickControl;

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

    this.wsadControl = new WSADControl(this);
    this.adControl = new ADControl(this);
    this.jumpYControl = new JumpYControl(this);
    this.dragAndDropControl = new DragAndDropControl(this);
    this.followCursorOnMoveControl = new FollowCursorOnMoveControl(this);
    this.followCursorOnClickControl = new FollowCursorOnClickControl(this);

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

  getWidth() {
    return this.textureHtml.getBoundingClientRect().width;
  }

  setWidth(width: number) {
    this.textureHtml.style.width = `${width}px`;
  }

  getHeight() {
    return this.textureHtml.getBoundingClientRect().height;
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

export class Spam {
  callback: Function;
  delay: number;
  id: number | null;
  isRunning: boolean;
  lastStopAfter: number | null;

  constructor(callback: Function, delay: number) {
    this.callback = callback;
    this.delay = delay;
    this.id = null;
    this.isRunning = false;
    this.lastStopAfter = null;
  }

  async start(stopAfter: number | null = null) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.id = setInterval(this.callback, this.delay);
    this.lastStopAfter = stopAfter;

    if (stopAfter) {
      setTimeout(() => {
        this.stop();
      }, stopAfter);

      await this.sleep(stopAfter);
    }
  }

  sleep(time: number) {
    return new Promise((resolve) => setTimeout(() => resolve(true), time));
  }

  updateDelay(delay: number) {
    this.delay = delay;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  getIsRunning() {
    return this.isRunning;
  }

  stop() {
    if (!this.id) return;
    this.isRunning = false;
    clearInterval(this.id);
  }
}

export class PlatformChunk {
  html: HTMLElement;
  width: number;
  height: number;

  constructor(html: HTMLElement, height: number) {
    this.html = html;
    this.width = html.getBoundingClientRect().width;
    this.height = height;
  }

  getHeight() {
    return this.height;
  }

  setWidth(width: number) {
    this.width = width;
    this.html.style.width = `${width}px`;
  }
}

export class Platform extends GameObject {
  static PLATFORM_CLASS_NAME = "platform";
  static PLATFORM_CHUNK_SIZE = window.innerWidth;

  width: number;
  chunks: PlatformChunk[];
  chunksContainer: HTMLElement;
  chunkSize: number;

  constructor(scene: Scene) {
    const container = document.createElement("div");
    container.className = Platform.PLATFORM_CLASS_NAME;
    container.style.overflow = "hidden";
    container.style.display = "flex";

    super(scene, container);

    this.chunksContainer = container;
    this.chunkSize = Platform.PLATFORM_CHUNK_SIZE;
    this.chunks = [];
    this.width = 0;
  }

  renderNextChunk(chunk: PlatformChunk) {
    chunk.setWidth(this.getChunkSize());

    this.width = this.width + this.getChunkSize();
    this.scene.setWidth(this.width);

    this.chunks.push(chunk);
    this.chunksContainer.append(chunk.html);
  }

  getChunkSize() {
    return this.chunkSize;
  }

  setChunkSize(chunkSize: number) {
    this.chunkSize = chunkSize;
  }
}

export {
  GameKeyboardEvent,
  KeyboardEventHtmlName,
  KeyboardKey,
  KeyDownEvent,
} from "./events/keyboard";

export {
  GameMouseEvent,
  MouseEventHtmlName,
  MouseDownEvent,
} from "./events/mouse";

export {
  GameEvent,
  GameKeyboardEventListener,
  GameMouseEventListener,
  GameListenersList,
} from "./events/index";

export {
  WSADControl,
  ADControl,
  JumpYControl,
  FollowCursorOnMoveControl,
  FollowCursorOnClickControl,
  DragAndDropControl,
  ControlEventListener,
  ControlEvent,
  StatusActiveControlEvent,
  StatusInactiveControlEvent,
} from "./controls";
