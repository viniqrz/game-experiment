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
    const KEYS = ["w", "s", "a", "d"];
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
  }

  getWsadControl() {
    return this.wsadControl;
  }

  setColor(color) {
    console.log(color);
    this.html.style.backgroundColor = color;
  }

  getColor() {
    return this.html.style.backgroundColor;
  }

  setY(y) {
    this.y = y;
    this.html.style.top = `${y}px`;
  }

  setX(x) {
    this.x = x;
    this.html.style.left = `${x}px`;
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

class WSADControl {
  constructor(object, active = false) {
    this.active = active;
    this.object = object;
    this.events = [];

    this.init();
  }

  init() {
    const objectMoveTopSpam = new Spam(() => {
      this.object.up();
    }, 5);
    const objectMoveBottomSpam = new Spam(() => {
      this.object.down();
    }, 5);
    const objectMoveLeftSpam = new Spam(() => {
      this.object.left();
    }, 5);
    const objectMoveRightSpam = new Spam(() => {
      this.object.right();
    }, 5);

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

(function init() {
  const screen = new GameScreen();
  const scene = new Scene();
  const char1 = new Character(scene, "Robert");
  const char2 = new Character(scene, "Jon");

  screen.setScene(scene);

  scene.addObject(char1);
  scene.addObject(char2);

  char1.setXY(100, 100);
  char2.setXY(200, 350);

  const characters = [char1, char2];

  characters.forEach((char) => {
    const clickToGetHello = new MouseDownEvent(() => {
      char.getWsadControl().setActive(!char.getWsadControl().getActive());

      if (char.getWsadControl().getActive()) {
        char.setColor("tomato");
      } else {
        char.setColor("cyan");
      }
    });

    char.mouse.addEvent(clickToGetHello);
  });
})();
