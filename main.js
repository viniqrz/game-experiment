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

class MouseEvent {
  constructor(callback, type) {
    this.callback = callback;
    this.type = type;
  }
}

class KeyboardEvent {
  constructor(callback, key, type) {
    this.callback = callback;
    this.key = key;
    this.type = type;
  }
}

class KeyDownEvent extends KeyboardEvent {
  constructor(key, callback) {
    super(callback, key, "keydown");
    this.type = "keydown";
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
    const TYPES = [new KeyDownEvent().type];

    this.typesCallbacks = new Map();

    for (const type of TYPES) {
      this.typesCallbacks.set(type, new Map());
      for (const key of KEYS) {
        this.typesCallbacks.get(type).set(key, []);
      }
    }

    for (const [type, keys] of this.typesCallbacks) {
      this.parentNode.addEventListener(type, (e) => {
        for (const [key, callbacks] of keys) {
          if (key === e.key) {
            for (const callback of callbacks) {
              callback(e);
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
    this.typesCallbacks.get(event.type).get(event.key).push(event.callback);
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
  constructor(html) {
    this.html = html;
  }

  setY(y) {
    this.html.style.top = `${y}px`;
  }

  setX(x) {
    this.html.style.left = `${x}px`;
  }

  setXY(x, y) {
    this.setX(x);
    this.setY(y);
  }
}

class Character extends GameObject {
  constructor(name, age, items) {
    const html = document.createElement("div");
    html.classList.add("character");

    super(html);

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

(function init() {
  const screen = new GameScreen();
  const char1 = new Character("Robert");
  const char2 = new Character("Jon");
  const scene = new Scene();

  screen.setScene(scene);

  scene.addObject(char1);
  scene.addObject(char2);

  char1.setXY(100, 100);
  char2.setXY(200, 350);

  const pressDToMoveRight = new KeyDownEvent("d", () => {
    char1.sayHello();
    console.log("Olá");
  });

  scene.keyboard.addEvent(pressDToMoveRight);
  scene.keyboard.addEvent(pressDToMoveRight);

  const clickToGetHello = new MouseDownEvent(() => {
    char2.sayHello();
  });

  scene.mouse.addEvent(clickToGetHello);
  scene.mouse.addEvent(clickToGetHello);
})();
