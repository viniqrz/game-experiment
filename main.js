const main = document.getElementById("main");

const setElementChildren = (element, children) => {
  element.innerHTML = "";
  children.forEach((child) => element.appendChild(child));
};

class GameScreen {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.html = document.createElement("div");
    this.html.classList.add("screen");

    setElementChildren(main, [this.html]);
  }

  getScreenSize() {
    return { width: this.width, height: this.height };
  }

  setScene(scene) {
    this.scene = scene;
    setElementChildren(this.html, [this.scene.getHtml()]);
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

class Scene {
  constructor() {
    this.objects = [];

    this.html = document.createElement("div");
    this.html.classList.add("scene");
    this.mouse = new MouseEventsList(window);
    this.keyboard = new KeyboardEventsList(window);

    document.addEventListener("contextmenu", (event) => event.preventDefault());

    this.initGravity();
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

  requestCoordinateUpdate(actor, isPositive, type) {
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
    const { left, right, top, bottom } =
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

  setX(x) {
    const isPositive = this.x < x;
    const allowed = this.scene.requestXUpdate(this, isPositive);
    if (!allowed) return;

    this.x = x;

    this.getContainerHtml().style.left = `${x}px`;
  }

  setY(y) {
    const isPositive = this.y < y;
    const allowed = this.scene.requestYUpdate(this, isPositive);
    if (!allowed) return;

    this.y = y;

    this.getContainerHtml().style.top = `${y}px`;
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

class Control {
  constructor(object, active = false) {
    this.active = active;
    this.object = object;
    this.events = [];
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
  constructor(object, active = false) {
    super(object, active);

    this.lastCursorX = 0;
    this.lastCursorY = 0;
    this.smoothness = 4;

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

    const RADIUS_THRESHOLD = 2;

    if (distances.left > RADIUS_THRESHOLD) this.leftSpam.start();
    if (distances.right > RADIUS_THRESHOLD) this.rightSpam.start();
    if (distances.top > RADIUS_THRESHOLD) this.upSpam.start();
    if (distances.bottom > RADIUS_THRESHOLD) this.downSpam.start();
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

    this.goLeftSpam = new Spam(() => {
      this.object.left();
    }, this.spamDelay);
    this.goRightSpam = new Spam(() => {
      this.object.right();
    }, this.spamDelay);

    this.init();
  }

  init() {
    const keyDownA = new KeyDownEvent("a", () => {
      this.goLeftSpam.start();
    });

    const keyDownD = new KeyDownEvent("d", () => {
      this.goRightSpam.start();
    });

    const keyUpA = new KeyUpEvent("a", () => {
      this.goLeftSpam.stop();
    });

    const keyUpD = new KeyUpEvent("d", () => {
      this.goRightSpam.stop();
    });

    this.appendEventToScene(keyDownA);
    this.appendEventToScene(keyDownD);

    this.appendEventToScene(keyUpA);
    this.appendEventToScene(keyUpD);
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
