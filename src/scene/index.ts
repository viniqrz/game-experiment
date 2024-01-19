import { Camera } from "../camera";
import { KeyboardEventsList } from "../events/keyboard";
import { MouseEventsList } from "../events/mouse";
import { GameObject, GameObjectEvent } from "../object";
import { Spam } from "../spam";

export abstract class Scene {
  objects: GameObject[];
  html: HTMLElement;
  mouse: MouseEventsList;
  keyboard: KeyboardEventsList;
  camera: Camera | null;
  closedBorders: boolean;
  gravitySpam: Spam;
  ID: string;

  constructor() {
    this.ID = Math.random().toString().slice(2);
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
    }, 1);
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
    return (
      this.html.getBoundingClientRect().width ||
      Number(this.html.style.width.split("px")[0])
    );
  }

  getHeight() {
    return (
      this.html.getBoundingClientRect().height ||
      Number(this.html.style.height.split("px")[0])
    );
  }

  setHeight(height: number) {
    this.html.style.height = `${height}px`;
  }

  setBackgroundImage(
    url: string,
    options: Partial<{
      repeat: string;
      size: string;
      attachment: string;
    }>
  ) {
    this.setBackground(`url("${url}")`, options);
  }

  setBackground(
    background: string,
    options: Partial<{
      repeat: string;
      size: string;
      attachment: string;
    }> = {
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
    this.html.style.backgroundRepeat = options.repeat || "repeat";
    this.html.style.backgroundSize = options.size || "contain";
    this.html.style.backgroundAttachment = options.attachment || "fixed";
  }

  getBackground() {
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

    // case 1 upper
    const upper =
      boundariesA.top < boundariesB.top && boundariesA.bottom > boundariesB.top;

    // case 2 middle

    const middle =
      boundariesA.top >= boundariesB.top &&
      boundariesA.bottom <= boundariesB.bottom;

    // case 3 lower

    const lower =
      boundariesA.bottom > boundariesB.bottom &&
      boundariesA.top < boundariesB.bottom;

    return upper || middle || lower;
  }

  checkIfThereIsXAxisOverlap(objectA: GameObject, objectB: GameObject) {
    const boundariesA = objectA.getBoundaries();
    const boundariesB = objectB.getBoundaries();

    // case 1 left
    const left =
      boundariesA.left < boundariesB.left &&
      boundariesA.right > boundariesB.left;

    // case 2 middle

    const middle =
      boundariesA.left >= boundariesB.left &&
      boundariesA.right <= boundariesB.right;

    // case 3 right

    const right =
      boundariesA.right > boundariesB.right &&
      boundariesA.left < boundariesB.right;

    return left || middle || right;
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

  isObjectWithinBorders(
    actor: GameObject,
    isPositive: boolean,
    type: "X" | "Y"
  ) {
    const sceneBoundaries = this.getBoundaries();

    if (type === "X") {
      if (isPositive) {
        if (actor.getX() + actor.getWidth() >= sceneBoundaries.right) {
          actor.emit(GameObjectEvent.LEAVE_SCENE_RIGHT, null);
          return false;
        }
      } else {
        if (actor.getX() <= sceneBoundaries.left) {
          actor.emit(GameObjectEvent.LEAVE_SCENE_LEFT, null);

          return false;
        }
      }
    }

    if (type === "Y") {
      if (isPositive) {
        if (actor.getY() + actor.getHeight() >= sceneBoundaries.bottom) {
          actor.emit(GameObjectEvent.LEAVE_SCENE_BOTTOM, null);

          return false;
        }
      } else {
        if (actor.getY() <= sceneBoundaries.top) {
          actor.emit(GameObjectEvent.LEAVE_SCENE_TOP, null);

          return false;
        }
      }
    }

    return true;
  }

  requestCoordinateUpdate(
    actor: GameObject,
    isPositive: boolean,
    type: "X" | "Y"
  ) {
    if (this.closedBorders) {
      if (!this.isObjectWithinBorders(actor, isPositive, type)) {
        actor.emit(GameObjectEvent.LEAVE_SCENE, null);
        return false;
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
          actor.emit(GameObjectEvent.COLLISION, object);
          actor.emit(GameObjectEvent.COLLISION_RIGHT, object);
          return false;
        } else {
          if (actorBoundaries.right < objectBoundaries.right) continue;
          if (actorBoundaries.left > objectBoundaries.right) continue;
          actor.emit(GameObjectEvent.COLLISION, object);
          actor.emit(GameObjectEvent.COLLISION_LEFT, object);
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
          actor.emit(GameObjectEvent.COLLISION, object);
          actor.emit(GameObjectEvent.COLLISION_BOTTOM, object);
          return false;
        } else {
          if (actorBoundaries.bottom < objectBoundaries.bottom) continue;
          if (actorBoundaries.top > objectBoundaries.bottom) continue;
          actor.emit(GameObjectEvent.COLLISION, object);
          actor.emit(GameObjectEvent.COLLISION_TOP, object);
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
