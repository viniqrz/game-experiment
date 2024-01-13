const main = document.getElementById("main");

class GameScreen {
  constructor() {
    if (window.gameScreen) return window.gameScreen;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.html = document.createElement("div");
    this.html.classList.add("screen");

    main.innerHTML = "";
    main.appendChild(this.html);

    window.gameScreen = this;
  }

  getScreenSize() {
    return { width: this.width, height: this.height };
  }

  setActiveScene(scene) {
    this.scene = scene;
    this.html.innerHTML = "";
    this.html.appendChild(this.scene.getHtml());
  }
}

class GameEvent {
  constructor(callback, type, active = true) {
    this.callback = callback;
    this.type = type;
    this.active = active;
  }

  setActive(active) {
    this.active = active;
  }
}

class MouseEvent extends GameEvent {
  constructor(callback, type) {
    super(callback, type);
  }
}

class KeyboardEvent extends GameEvent {
  constructor(callback, key, type) {
    super(callback, type);
    this.key = key;
  }
}

class KeyDownEvent extends KeyboardEvent {
  constructor(key, callback) {
    super(callback, key, "keydown");
    this.type = "keydown";
  }
}

class KeyUpEvent extends KeyboardEvent {
  constructor(key, callback) {
    super(callback, key, "keyup");
    this.type = "keyup";
  }
}

class MouseDownEvent extends MouseEvent {
  constructor(callback) {
    super(callback, "mousedown");
    this.type = "mousedown";
  }
}

class MouseUpEvent extends MouseEvent {
  constructor(callback) {
    super(callback, "mouseup");
    this.type = "mouseup";
  }
}

class MouseMoveEvent extends MouseEvent {
  constructor(callback) {
    super(callback, "mousemove");
    this.type = "mousemove";
  }
}

class MouseEnterEvent extends MouseEvent {
  constructor(callback) {
    super(callback, "mouseenter");
    this.type = "mouseenter";
  }
}

class MouseLeaveEvent extends MouseEvent {
  constructor(callback) {
    super(callback, "mouseleave");
    this.type = "mouseleave";
  }
}

class MouseClickEvent extends MouseEvent {
  constructor(callback) {
    super(callback, "click");
    this.type = "click";
  }
}

class MouseEventsList {
  constructor(parentNode) {
    this.parentNode = parentNode;
    this.events = [];
    this.init();
  }

  init() {
    this.typesCallbacks = new Map();

    this.typesCallbacks.set(new MouseDownEvent().type, []);
    this.typesCallbacks.set(new MouseMoveEvent().type, []);
    this.typesCallbacks.set(new MouseUpEvent().type, []);
    this.typesCallbacks.set(new MouseEnterEvent().type, []);
    this.typesCallbacks.set(new MouseLeaveEvent().type, []);
    this.typesCallbacks.set(new MouseClickEvent().type, []);

    for (const [type, callbacks] of this.typesCallbacks) {
      this.parentNode.addEventListener(type, (e) => {
        for (const callback of callbacks) {
          callback(e);
        }
      });
    }
  }

  getEvents() {
    return this.events;
  }

  addEvent(event) {
    this.events.push(event);
    this.typesCallbacks.get(event.type).push((e) => {
      if (event.active) event.callback(e);
    });
  }
}

class KeyboardEventsList {
  constructor(parentNode) {
    this.parentNode = parentNode;
    this.events = [];

    this.init();
  }

  init() {
    const KEYS = ["w", "s", "a", "d", " "];
    const TYPES = [new KeyDownEvent().type, new KeyUpEvent().type];

    this.typesCallbacks = new Map();

    for (const type of TYPES) {
      this.typesCallbacks.set(type, new Map());
      for (const key of KEYS) {
        this.typesCallbacks.get(type).set(key, []);
      }
    }

    for (const [type, keys] of this.typesCallbacks) {
      this.parentNode.addEventListener(type, (e) => {
        console.log(e.key);
        for (const [key, events] of keys) {
          if (key === e.key) {
            for (const event of events) {
              if (event.active) {
                event.callback(e);
              }
            }
          }
        }
      });
    }
  }

  getEvents() {
    return this.events;
  }

  addEvent(event) {
    this.events.push(event);
    this.typesCallbacks.get(event.type).get(event.key).push(event);
  }
}

class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.attachedObject = null;
  }

  getAttachedObject() {
    return this.attachedObject;
  }

  setAttachedObject(obj) {
    this.attachedObject = obj;
  }

  getX() {
    return this.x;
  }

  moveX(diff) {
    this.setX(this.x + diff);
  }

  setX(x) {
    if (x < 0 || x >= document.body.scrollWidth) return;
    this.x = x;
    window.scrollTo(this.x, this.y);
  }

  moveY(diff) {
    this.setY(this.y + diff);
  }

  getY() {
    return this.y;
  }

  setY(y) {
    if (y < 0 || y >= document.body.scrollHeight) return;
    this.y = y;
    window.scrollTo(this.x, this.y);
  }

  checkIfObjectIsBeforeXAxisCenter(object) {
    const isBeforeCenter =
      object.getX() + object.getWidth() / 2 - this.x < window.innerWidth / 2;
    return isBeforeCenter;
  }

  checkIfObjectIsAfterXAxisCenter(object) {
    const isAfterCenter =
      object.getX() + object.getWidth() / 2 - this.x > window.innerWidth / 2;
    return isAfterCenter;
  }

  checkIfObjectIsBeforeYAxisCenter(object) {
    const isBeforeCenter =
      object.getY() + object.getHeight() / 2 - this.y < window.innerHeight / 2;
    return isBeforeCenter;
  }

  checkIfObjectIsAfterYAxisCenter(object) {
    const isAfterCenter =
      object.getY() + object.getHeight() / 2 - this.y > window.innerHeight / 2;
    return isAfterCenter;
  }

  setXY(x, y) {
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

class Scene {
  constructor() {
    this.objects = [];

    this.html = document.createElement("div");
    this.html.classList.add("scene");
    this.html.style.overflow = "hidden";

    this.mouse = new MouseEventsList(window);
    this.keyboard = new KeyboardEventsList(window);

    document.addEventListener("contextmenu", (event) => event.preventDefault());
    window.addEventListener("keydown", function (e) {
      if (e.key == " " && e.target == document.body) {
        e.preventDefault();
      }
    });

    this.setWidth(window.innerWidth);
    this.initGravity();

    this.camera = null;
    this.closedBorders = true;
  }

  getClosedBorders() {
    return this.closedBorders;
  }

  setClosedBorders(val) {
    this.closedBorders = val;
  }

  setCamera(camera) {
    this.camera = camera;
  }

  getCamera() {
    return this.camera;
  }

  setWidth(width) {
    this.html.style.width = `${width}px`;
  }

  getWidth() {
    return this.html.getBoundingClientRect().width;
  }

  getHeight() {
    return this.html.getBoundingClientRect().height;
  }

  setHeight(height) {
    this.html.style.height = `${height}px`;
  }

  setBackgroundImage(url, options) {
    this.setBackground(`url("${url}")`, options);
  }

  setBackground(background, options = {}) {
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

  getBackground(background) {
    return this.html.style.background;
  }

  setBackgroundColor(color) {
    this.html.style.backgroundColor = color;
  }

  getBackgroundColor() {
    return this.html.style.backgroundColor;
  }

  addObject(gameObject) {
    this.objects.push(gameObject);
    this.html.appendChild(gameObject.getContainerHtml());
  }

  getHtml() {
    return this.html;
  }

  getObjects() {
    return this.objects;
  }

  checkIfThereIsYAxisOverlap(objectA, objectB) {
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

  checkIfThereIsXAxisOverlap(objectA, objectB) {
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

  requestXUpdate(actor, isPositive) {
    return this.requestCoordinateUpdate(actor, isPositive, "X");
  }
  requestYUpdate(actor, isPositive) {
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

  requestCoordinateUpdate(actor, isPositive, type) {
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

  initGravity() {
    this.gravitySpam = new Spam(() => {
      this.ensureGravity();
    }, 3);

    this.gravitySpam.start();
  }

  ensureGravity() {
    const objects = this.getObjects();

    for (const object of objects) {
      if (object.getGravity()) {
        object.down(object.gravityIntensity);
      }
    }
  }

  findObjectBelowWithinRange(actor, range = 0) {
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

  requestJump(actor) {
    const objectBelow = this.findObjectBelowWithinRange(actor);
    return Boolean(objectBelow);
  }

  notifyXChange(actor, diff) {
    this.moveAttachedCameraX(actor, diff);
  }

  moveAttachedCameraX(actor, diff) {
    if (!actor.checkIfHasCameraAttached()) return;

    if (diff > 0 && this.getCamera().checkIfObjectIsBeforeXAxisCenter(actor))
      return;
    if (diff < 0 && this.getCamera().checkIfObjectIsAfterXAxisCenter(actor))
      return;

    this.getCamera().moveX(diff);
  }

  notifyYChange(actor, diff) {
    this.moveAttachedCameraY(actor, diff);
  }

  moveAttachedCameraY(actor, diff) {
    if (!actor.checkIfHasCameraAttached()) return;

    if (diff > 0 && this.getCamera().checkIfObjectIsBeforeYAxisCenter(actor))
      return;
    if (diff < 0 && this.getCamera().checkIfObjectIsAfterYAxisCenter(actor))
      return;

    this.getCamera().moveY(diff);
  }
}

class GameObject {
  static GAME_OBJECT_CLASS_NAME = "game-object-container";

  constructor(scene, textureHtml) {
    this.ID = Math.random().toString().slice(2);

    this.containerHtml = document.createElement("div");
    this.containerHtml.classList.add(GameObject.GAME_OBJECT_CLASS_NAME);
    this.containerHtml.appendChild(textureHtml);

    this.textureHtml = textureHtml;

    this.scene = scene;

    this.containerHtml.id = this.ID;
    this.containerHtml.style.position = "absolute";
    this.containerHtml.style.overflow = "hidden";
    this.containerHtml.draggable = "false";

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
      this.scene.getCamera().getAttachedObject() &&
      this.scene.getCamera().getAttachedObject().ID === this.ID
    );
  }

  setContainerWidth(width) {
    this.containerHtml.style.width = `${width}px`;
  }

  getContainerWidth() {
    return this.containerHtml.getBoundingClientRect().width;
  }

  getWidth() {
    return this.textureHtml.getBoundingClientRect().width;
  }

  setWidth(width) {
    this.textureHtml.style.width = `${width}px`;
  }

  getHeight() {
    return this.textureHtml.getBoundingClientRect().height;
  }

  setHeight(height) {
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

  updateTextureHtml(textureHtml) {
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

  setCollision(val) {
    this.collision = val;
  }

  getCollision() {
    return this.collision;
  }

  setGravity(val) {
    this.gravity = val;
  }

  getGravity() {
    return this.gravity;
  }

  setGravityIntensity(val) {
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

  setX(x) {
    const diff = x - this.x;
    const isPositive = diff > 0;
    const allowed = this.scene.requestXUpdate(this, isPositive);
    if (!allowed) return;

    this.x = x;

    this.getContainerHtml().style.left = `${x}px`;

    this.notifyXChange(diff);
  }

  notifyXChange(diff) {
    this.scene.notifyXChange(this, diff);
  }

  getY() {
    return this.y;
  }

  setY(y) {
    const diff = y - this.y;
    const isPositive = diff > 0;
    const allowed = this.scene.requestYUpdate(this, isPositive);
    if (!allowed) return;

    this.y = y;

    this.getContainerHtml().style.top = `${y}px`;

    this.notifyYChange(diff);
  }

  notifyYChange(diff) {
    this.scene.notifyYChange(this, diff);
  }

  setZ(z) {
    this.z = z;

    this.getContainerHtml().style.zIndex = z;
  }

  setXY(x, y) {
    this.setX(x);
    this.setY(y);
  }

  setXYZ(x, y, z) {
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

class PlatformChunk {
  constructor(html, height) {
    this.html = html;
    this.width = html.getBoundingClientRect().width;
    this.height = height;
  }

  getHeight() {
    return this.height;
  }

  setWidth(width) {
    this.width = width;
    this.html.style.width = `${width}px`;
  }
}

class Platform extends GameObject {
  static PLATFORM_CLASS_NAME = "platform";
  static PLATFORM_CHUNK_SIZE = window.innerWidth;

  constructor(scene) {
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

  renderNextChunk(chunk) {
    chunk.setWidth(this.getChunkSize());

    this.width = this.width + this.getChunkSize();
    this.scene.setWidth(this.width);

    this.chunks.push(chunk);
    this.chunksContainer.append(chunk.html);
  }

  getChunkSize() {
    return this.chunkSize;
  }

  setChunkSize(chunkSize) {
    this.chunkSize = chunkSize;
  }
}

class ControlEvent {}
class StatusActiveControlEvent extends ControlEvent {}
class StatusInactiveControlEvent extends ControlEvent {}

class ControlEventListener {
  constructor(event, callback) {
    this.event = event;
    this.callback = callback;
  }
}

class Control {
  constructor(object, active = false) {
    this.active = active;
    this.object = object;
    this.events = [];
    this.controlListeners = [];
  }

  addControlEventListener(callback) {
    this.controlListeners.push(callback);
  }

  notify(event) {
    this.controlListeners.forEach((listener) => {
      console.log(listener.event.name, event.name);
      if (event.name === listener.event.name) listener.callback();
    });
  }

  getActive() {
    return this.active;
  }

  setActive(active) {
    this.active = active;

    if (active) {
      this.events.forEach((event) => {
        event.active = true;
      });
    } else {
      this.events.forEach((event) => {
        event.active = false;
      });
    }
  }

  /**
   * @param {GameEvent} event
   * @returns {void}
   * @memberof Control
   * @description Append event to the object's SCENE and to the control
   */
  appendEventToScene(event) {
    this.events.push(event);
    event.setActive(this.active);

    if (event instanceof KeyboardEvent) {
      this.object.scene.keyboard.addEvent(event);
    }

    if (event instanceof MouseEvent) {
      this.object.scene.mouse.addEvent(event);
    }
  }

  /**
   * @param {GameEvent} event
   * @returns {void}
   * @memberof Control
   * @description Append event to the object and to the control
   */
  appendEventToObject(event) {
    this.events.push(event);
    event.setActive(this.active);

    if (event instanceof KeyboardEvent) {
      this.object.keyboard.addEvent(event);
    }

    if (event instanceof MouseEvent) {
      this.object.mouse.addEvent(event);
    }
  }

  appendInitialEvents(events) {
    events.forEach((event) => this.appendEvent(event));
  }
}

class DragAndDropControl extends Control {
  constructor(object, active = false) {
    super(object, active);

    this.mouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;

    this.init();
  }

  init() {
    const mouseMoveEvent = new MouseMoveEvent((e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (!this.mouseDown) return;

      requestAnimationFrame(() => {
        const objectBoundaries = this.object.getBoundaries();

        const width = objectBoundaries.right - objectBoundaries.left;
        const height = objectBoundaries.bottom - objectBoundaries.top;

        this.object.setXY(this.mouseX - width / 2, this.mouseY - height / 2);
      });
    });

    const mouseDownEvent = new MouseDownEvent((e) => {
      this.mouseDown = true;
      document.body.style.cursor = "grabbing";
    });

    const mouseUpEvent = new MouseUpEvent((e) => {
      this.mouseDown = false;
      document.body.style.cursor = "default";
    });

    const mouseEnterEvent = new MouseEnterEvent((e) => {
      if (this.mouseDown) return;
      document.body.style.cursor = "grab";
    });

    const mouseLeaveEvent = new MouseLeaveEvent((e) => {
      if (this.mouseDown) return;
      document.body.style.cursor = "default";
    });

    this.appendEventToObject(mouseEnterEvent);
    this.appendEventToObject(mouseLeaveEvent);
    this.appendEventToObject(mouseDownEvent);

    this.appendEventToScene(mouseUpEvent);
    this.appendEventToScene(mouseMoveEvent);
  }
}

class AbstractFollowCursorControl extends Control {
  static INITIAL_RADIUS_THRESHOLD = 2;

  constructor(object, active = false) {
    super(object, active);

    this.lastCursorX = 0;
    this.lastCursorY = 0;
    this.smoothness = 4;
    this.radiusThreshold = AbstractFollowCursorControl.INITIAL_RADIUS_THRESHOLD;

    this.rightSpam = new Spam(() => {
      if (this.getCursorDistancesReferentToObject().right > 0) {
        this.object.right();
      } else {
        this.rightSpam.stop();
      }
    }, this.smoothness);
    this.leftSpam = new Spam(() => {
      if (this.getCursorDistancesReferentToObject().left > 0) {
        this.object.left();
      } else {
        this.leftSpam.stop();
      }
    }, this.smoothness);
    this.upSpam = new Spam(() => {
      if (this.getCursorDistancesReferentToObject().top > 0) {
        this.object.up();
      } else {
        this.upSpam.stop();
      }
    }, this.smoothness);
    this.downSpam = new Spam(() => {
      if (this.getCursorDistancesReferentToObject().bottom > 0) {
        this.object.down();
      } else {
        this.downSpam.stop();
      }
    }, this.smoothness);
  }

  // abstract
  init() {}

  setRadiusThreshold(radiusThreshold) {
    this.radiusThreshold = radiusThreshold;
  }

  getRadiusThreshold() {
    return this.radiusThreshold;
  }

  setSmoothness(smoothness) {
    this.smoothness = smoothness;

    this.upSpam.updateDelay(smoothness);
    this.downSpam.updateDelay(smoothness);
    this.leftSpam.updateDelay(smoothness);
    this.rightSpam.updateDelay(smoothness);
  }

  getCursorDistancesReferentToObject() {
    const objectPosition = this.object.getBoundaries();

    const width = objectPosition.right - objectPosition.left;
    const height = objectPosition.bottom - objectPosition.top;

    const objectCenterX = objectPosition.left + width / 2;
    const objectCenterY = objectPosition.top + height / 2;

    const left = objectCenterX - this.lastCursorX;
    const right = this.lastCursorX - objectCenterX;
    const top = objectCenterY - this.lastCursorY;
    const bottom = this.lastCursorY - objectCenterY;

    return {
      left,
      right,
      top,
      bottom,
    };
  }

  follow() {
    const distances = this.getCursorDistancesReferentToObject();

    if (distances.left > this.radiusThreshold) this.leftSpam.start();
    if (distances.right > this.radiusThreshold) this.rightSpam.start();
    if (distances.top > this.radiusThreshold) this.upSpam.start();
    if (distances.bottom > this.radiusThreshold) this.downSpam.start();
  }
}

class FollowCursorOnClickControl extends AbstractFollowCursorControl {
  constructor(object, active = false) {
    super(object, active);

    this.mouseDown = false;

    this.init();
  }

  init() {
    const mouseDownEvent = new MouseDownEvent((e) => {
      this.mouseDown = !this.mouseDown;
      document.body.style.cursor = "grabbing";
    });

    const mouseEnterEvent = new MouseEnterEvent((e) => {
      if (this.mouseDown) return;
      document.body.style.cursor = "grab";
    });

    const mouseLeaveEvent = new MouseLeaveEvent((e) => {
      if (this.mouseDown) return;
      document.body.style.cursor = "default";
    });
    const objectFollowCursor = new MouseMoveEvent((e) => {
      this.lastCursorX = e.clientX;
      this.lastCursorY = e.clientY;
      if (this.mouseDown) this.follow();
    });

    this.appendEventToScene(objectFollowCursor);

    this.appendEventToObject(mouseEnterEvent);
    this.appendEventToObject(mouseLeaveEvent);
    this.appendEventToObject(mouseDownEvent);
  }
}

class FollowCursorOnMoveControl extends AbstractFollowCursorControl {
  constructor(object, active = false) {
    super(object, active);

    this.init();
  }

  init() {
    const objectFollowCursor = new MouseMoveEvent((e) => {
      this.lastCursorX = e.clientX;
      this.lastCursorY = e.clientY;
      this.follow();
    });

    this.appendEventToScene(objectFollowCursor);
  }
}

class JumpYControl extends Control {
  static INITIAL_SPAM_DELAY = 3;
  static INITIAL_DURATION = 500;
  static INITIAL_MAX_JUMPS = 1;
  static INITIAL_VERTICAL_STEP = 3;

  constructor(object, active = false) {
    super(object, active);

    this.maxJumps = JumpYControl.INITIAL_MAX_JUMPS;
    this.duration = JumpYControl.INITIAL_DURATION;
    this.verticalStep = JumpYControl.INITIAL_VERTICAL_STEP;

    this.spam1 = new Spam(() => {
      this.jump(this.verticalStep);
    }, JumpYControl.INITIAL_SPAM_DELAY);

    this.spam2 = new Spam(() => {
      this.jump(this.verticalStep / 2);
    }, JumpYControl.INITIAL_SPAM_DELAY);

    this.init();
  }

  init() {
    const keydownEvent = new KeyDownEvent(" ", () => this.handleJump());
    this.appendEventToScene(keydownEvent);
  }

  async handleJump() {
    const allowed = this.object.requestJump(this.maxJumps);
    if (!allowed) return;

    await this.spam1.start(this.duration * (3 / 4));
    await this.spam2.start(this.duration * (1 / 4));
  }

  jump(step) {
    this.object.up(step);
  }

  setDuration(duration) {
    this.duration = duration;
  }

  setSpamDelay(spamDelay) {
    this.spam.updateDelay(spamDelay);
  }
}

class ADControl extends Control {
  constructor(object, active = false) {
    super(object, active);

    const INITIAL_SPAM = 2;

    this.spamDelay = INITIAL_SPAM;

    this.isRunning = false;

    this.isKeyDPressed = false;
    this.isKeyAPressed = false;

    this.goLeftSpam = new Spam(() => {
      this.object.left();
      this.setIsRunning(true);
    }, this.spamDelay);
    this.goRightSpam = new Spam(() => {
      this.object.right();
      this.setIsRunning(true);
    }, this.spamDelay);

    this.init();
  }

  init() {
    const keyDownA = new KeyDownEvent("a", () => {
      this.isKeyAPressed = true;
      this.goLeftSpam.start();
    });

    const keyDownD = new KeyDownEvent("d", () => {
      this.isKeyDPressed = true;
      this.goRightSpam.start();
    });

    const keyUpA = new KeyUpEvent("a", () => {
      this.goLeftSpam.stop();
      this.isKeyAPressed = false;
      if (!this.isKeyDPressed) this.setIsRunning(false);
    });

    const keyUpD = new KeyUpEvent("d", () => {
      this.goRightSpam.stop();
      this.isKeyDPressed = false;
      if (!this.isKeyAPressed) this.setIsRunning(false);
    });

    this.appendEventToScene(keyDownA);
    this.appendEventToScene(keyDownD);

    this.appendEventToScene(keyUpA);
    this.appendEventToScene(keyUpD);
  }

  setIsRunning(val) {
    if (val === this.isRunning) return;
    this.isRunning = val;
    this.notify(val ? StatusActiveControlEvent : StatusInactiveControlEvent);
  }

  getIsRunning() {
    return this.isRunning;
  }

  updateSpamDelay(spamDelay) {
    this.spamDelay = spamDelay;

    this.goLeftSpam.updateDelay(spamDelay);
    this.goRightSpam.updateDelay(spamDelay);
  }
}

class WSADControl extends Control {
  constructor(object, active = false) {
    super(object, active);

    const INITIAL_SPAM = 2;

    this.spamDelay = INITIAL_SPAM;

    this.goUpSpam = new Spam(() => {
      this.object.up();
    }, this.spamDelay);
    this.goDownSpam = new Spam(() => {
      this.object.down();
    }, this.spamDelay);
    this.goLeftSpam = new Spam(() => {
      this.object.left();
    }, this.spamDelay);
    this.goRightSpam = new Spam(() => {
      this.object.right();
    }, this.spamDelay);

    this.init();
  }

  init() {
    const keyDownW = new KeyDownEvent("w", () => {
      this.goUpSpam.start();
    });

    const keyDownS = new KeyDownEvent("s", () => {
      this.goDownSpam.start();
    });

    const keyDownA = new KeyDownEvent("a", () => {
      this.goLeftSpam.start();
    });

    const keyDownD = new KeyDownEvent("d", () => {
      this.goRightSpam.start();
    });

    const keyUpW = new KeyUpEvent("w", () => {
      this.goUpSpam.stop();
    });

    const keyUpS = new KeyUpEvent("s", () => {
      this.goDownSpam.stop();
    });

    const keyUpA = new KeyUpEvent("a", () => {
      this.goLeftSpam.stop();
    });

    const keyUpD = new KeyUpEvent("d", () => {
      this.goRightSpam.stop();
    });

    this.appendEventToScene(keyDownW);
    this.appendEventToScene(keyDownS);
    this.appendEventToScene(keyDownA);
    this.appendEventToScene(keyDownD);

    this.appendEventToScene(keyUpW);
    this.appendEventToScene(keyUpS);
    this.appendEventToScene(keyUpA);
    this.appendEventToScene(keyUpD);
  }

  updateSpeed(speed) {
    this.spamDelay = speed;

    this.goUpSpam.updateDelay(speed);
    this.goDownSpam.updateDelay(speed);
    this.goLeftSpam.updateDelay(speed);
    this.goRightSpam.updateDelay(speed);
  }
}

class Spam {
  constructor(callback, delay) {
    this.callback = callback;
    this.delay = delay;
    this.id = null;
    this.isRunning = false;
    this.lastStopAfter = null;
  }

  async start(stopAfter = null) {
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

  sleep(time) {
    return new Promise((resolve) => setTimeout(() => resolve(), time));
  }

  updateDelay(delay) {
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
    this.isRunning = false;
    clearInterval(this.id);
  }
}

const randomRGBColor = () => {
  return ["blue", "limegreen", "tomato", "cyan", "lightblue"][
    Math.round(Math.random() * 5)
  ];
};
