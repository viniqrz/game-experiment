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

class MouseEventsList {
  constructor(parentNode) {
    this.parentNode = parentNode;
    this.events = [];
    this.init();
  }

  init() {
    this.typesCallbacks = new Map();

    this.typesCallbacks.set(new MouseDownEvent().type, []);

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
    this.typesCallbacks.get(event.type).push(event.callback);
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

    this.initGravity();
  }

  addObject(gameObject) {
    this.objects.push(gameObject);
    this.html.appendChild(gameObject.getHtml());
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

    const hasXRightOverlap =
      (boundariesA.right > boundariesB.left &&
        boundariesA.left < boundariesB.left) ||
      boundariesA.right === boundariesB.right;

    return hasXLeftOverlap || hasXRightOverlap;
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
      if (!object.collision) continue;
      if (object.ID === actor.ID) continue;
      if (object.z !== actor.z) continue;

      const actorBoundaries = actor.getBoundaries();
      const objectBoundaries = object.getBoundaries();

      if (type === "X") {
        const isThereYAxisOverlap = this.checkIfThereIsYAxisOverlap(
          actor,
          object
        );
        if (!isThereYAxisOverlap) return true;

        if (isPositive) {
          if (actorBoundaries.left > objectBoundaries.left) return true;

          return !(actorBoundaries.right >= objectBoundaries.left);
        } else {
          if (actorBoundaries.right < objectBoundaries.right) return true;

          return !(actorBoundaries.left <= objectBoundaries.right);
        }
      }

      if (type === "Y") {
        const isThereXAxisOverlap = this.checkIfThereIsXAxisOverlap(
          actor,
          object
        );
        if (!isThereXAxisOverlap) return true;

        if (isPositive) {
          if (actorBoundaries.top > objectBoundaries.top) return true;

          return !(actorBoundaries.bottom >= objectBoundaries.top);
        } else {
          if (actorBoundaries.bottom < objectBoundaries.bottom) return true;

          return !(actorBoundaries.top <= objectBoundaries.bottom);
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
}

class GameObject {
  constructor(scene, html, color = "cyan") {
    this.html = html;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.mouse = new MouseEventsList(this.html);
    this.html.style.backgroundColor = color;

    this.scene = scene;

    this.wsadControl = new WSADControl(this);
    this.jumpYControl = new JumpYControl(this);

    this.collision = false;

    this.gravity = false;
    this.gravityIntensity = 0.5;

    this.ID = Math.random().toString().slice(2);
  }

  getBoundaries() {
    const { left, right, top, bottom } = this.html.getBoundingClientRect();
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

  getJumpYControl() {
    return this.jumpYControl;
  }

  setColor(color) {
    this.html.style.backgroundColor = color;
  }

  getColor() {
    return this.html.style.backgroundColor;
  }

  setX(x) {
    const isPositive = this.x < x;
    const allowed = this.scene.requestXUpdate(this, isPositive);
    if (!allowed) return;

    this.x = x;
    this.html.style.left = `${x}px`;
  }

  setY(y) {
    const isPositive = this.y < y;
    const allowed = this.scene.requestYUpdate(this, isPositive);
    if (!allowed) return;

    this.y = y;
    this.html.style.top = `${y}px`;
  }

  setZ(z) {
    this.z = z;
    this.html.style.zIndex = z;
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

  right(px = 2) {
    this.setX(this.x + px);
  }

  left(px = 2) {
    this.setX(this.x - px);
  }

  up(px = 2) {
    this.setY(this.y - px);
  }

  down(px = 2) {
    this.setY(this.y + px);
  }
}

class Character extends GameObject {
  constructor(scene, name, age, items) {
    const html = document.createElement("div");
    html.classList.add("character");

    super(scene, html);

    this.name = name;
    this.age = age;
    this.items = items;
  }

  sayHello() {
    alert(`Hello, my name is ${this.name}`);
  }

  getHtml() {
    return this.html;
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
}

class JumpYControl extends Control {
  constructor(object, active = false) {
    super(object, active);

    this.duration = 300;
    this.spamDelay = 1;

    this.init();
  }

  init() {
    const objectJumpSpam = new Spam(() => {
      this.object.up();
    }, this.spamDelay);

    this.events.push(
      new KeyDownEvent(" ", () => objectJumpSpam.start(this.duration))
    );

    for (const event of this.events) {
      event.setActive(this.active);
      this.object.scene.keyboard.addEvent(event);
    }
  }
}

class WSADControl extends Control {
  constructor(object, active = false) {
    super(object, active);

    this.init();
  }

  init() {
    const objectMoveTopSpam = new Spam(() => {
      this.object.up();
    }, 2);
    const objectMoveBottomSpam = new Spam(() => {
      this.object.down();
    }, 2);
    const objectMoveLeftSpam = new Spam(() => {
      this.object.left();
    }, 2);
    const objectMoveRightSpam = new Spam(() => {
      this.object.right();
    }, 2);

    this.events.push(new KeyDownEvent("w", () => objectMoveTopSpam.start()));
    this.events.push(new KeyDownEvent("s", () => objectMoveBottomSpam.start()));
    this.events.push(new KeyDownEvent("a", () => objectMoveLeftSpam.start()));
    this.events.push(new KeyDownEvent("d", () => objectMoveRightSpam.start()));

    this.events.push(new KeyUpEvent("w", () => objectMoveTopSpam.stop()));
    this.events.push(new KeyUpEvent("s", () => objectMoveBottomSpam.stop()));
    this.events.push(new KeyUpEvent("a", () => objectMoveLeftSpam.stop()));
    this.events.push(new KeyUpEvent("d", () => objectMoveRightSpam.stop()));

    for (const event of this.events) {
      event.setActive(this.active);
      this.object.scene.keyboard.addEvent(event);
    }
  }
}

class Spam {
  constructor(callback, delay) {
    this.callback = callback;
    this.delay = delay;
    this.id = null;
    this.spam = false;
  }

  start(stopAfter = null) {
    if (this.spam) return;
    this.spam = true;
    this.id = setInterval(this.callback, this.delay);

    if (stopAfter) {
      setTimeout(() => {
        this.stop();
      }, stopAfter);
    }
  }

  stop() {
    this.spam = false;
    clearInterval(this.id);
  }
}

const randomRGBColor = () => {
  return ["blue", "limegreen", "tomato", "cyan", "lightblue"][
    Math.round(Math.random() * 5)
  ];
};
