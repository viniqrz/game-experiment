import { GameKeyboardEventListener, GameMouseEventListener } from "../events";
import { KeyDownEvent, KeyUpEvent } from "../events/keyboard";
import {
  MouseDownEvent,
  MouseEnterEvent,
  MouseLeaveEvent,
  MouseMoveEvent,
  MouseUpEvent,
} from "../events/mouse";
import { GameObject } from "../object";
import { Spam } from "../spam";

export class ControlEvent {
  constructor() {}
}
export class StatusActiveControlEvent extends ControlEvent {
  constructor() {
    super();
  }
}
export class StatusInactiveControlEvent extends ControlEvent {
  constructor() {
    super();
  }
}

export class ControlEventListener {
  constructor(public event: ControlEvent, public callback: Function) {}
}

export class Control {
  events: Array<GameKeyboardEventListener | GameMouseEventListener>;
  object: GameObject;
  active: boolean;
  controlListeners: ControlEventListener[];

  constructor(object: GameObject, active = false) {
    this.active = active;
    this.object = object;
    this.events = [];
    this.controlListeners = [];
  }

  addControlEventListener(listener: ControlEventListener) {
    this.controlListeners.push(listener);
  }

  notify(event: ControlEvent) {
    this.controlListeners.forEach((listener) => {
      //@ts-ignore
      if (event.name === listener.event.name) listener.callback();
    });
  }

  getActive() {
    return this.active;
  }

  setActive(active: boolean) {
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

  appendEventListenerToScene(
    listener: GameKeyboardEventListener | GameMouseEventListener
  ) {
    this.events.push(listener);
    listener.setActive(this.active);

    if (listener instanceof GameKeyboardEventListener) {
      this.object.scene.keyboard.addListener(listener);
    }

    if (listener instanceof GameMouseEventListener) {
      this.object.scene.mouse.addListener(listener);
    }
  }

  appendEventListenerToObject(listener: GameMouseEventListener) {
    this.events.push(listener);
    listener.setActive(this.active);
    this.object.mouse.addListener(listener);
  }
}

export class DragAndDropControl extends Control {
  mouseX: number;
  mouseY: number;
  mouseDown: boolean;

  constructor(object: GameObject, active = false) {
    super(object, active);

    this.mouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;

    this.init();
  }

  init() {
    const mouseMoveEventListener = new GameMouseEventListener(
      new MouseMoveEvent(),
      (e: MouseEvent) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        if (!this.mouseDown) return;

        requestAnimationFrame(() => {
          const objectBoundaries = this.object.getBoundaries();

          const width = objectBoundaries.right - objectBoundaries.left;
          const height = objectBoundaries.bottom - objectBoundaries.top;

          this.object.setXY(this.mouseX - width / 2, this.mouseY - height / 2);
        });
      }
    );

    const mouseDownEventListener = new GameMouseEventListener(
      new MouseDownEvent(),
      (e: MouseEvent) => {
        this.mouseDown = true;
        document.body.style.cursor = "grabbing";
      }
    );

    const mouseUpEventListener = new GameMouseEventListener(
      new MouseUpEvent(),
      (e) => {
        this.mouseDown = false;
        document.body.style.cursor = "default";
      }
    );

    const mouseEnterEventListener = new GameMouseEventListener(
      new MouseEnterEvent(),
      (e) => {
        if (this.mouseDown) return;
        document.body.style.cursor = "grab";
      }
    );

    const mouseLeaveEventListener = new GameMouseEventListener(
      new MouseLeaveEvent(),
      (e) => {
        if (this.mouseDown) return;
        document.body.style.cursor = "default";
      }
    );

    this.appendEventListenerToObject(mouseEnterEventListener);
    this.appendEventListenerToObject(mouseLeaveEventListener);
    this.appendEventListenerToObject(mouseDownEventListener);

    this.appendEventListenerToScene(mouseUpEventListener);
    this.appendEventListenerToScene(mouseMoveEventListener);
  }
}

export class AbstractFollowCursorControl extends Control {
  lastCursorX: number;
  lastCursorY: number;
  smoothness: number;
  radiusThreshold: number;

  rightSpam: Spam;
  leftSpam: Spam;
  upSpam: Spam;
  downSpam: Spam;

  static INITIAL_RADIUS_THRESHOLD = 2;

  constructor(object: GameObject, active = false) {
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

  setRadiusThreshold(radiusThreshold: number) {
    this.radiusThreshold = radiusThreshold;
  }

  getRadiusThreshold() {
    return this.radiusThreshold;
  }

  setSmoothness(smoothness: number) {
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

export class FollowCursorOnClickControl extends AbstractFollowCursorControl {
  mouseDown: boolean;

  constructor(object: GameObject, active = false) {
    super(object, active);

    this.mouseDown = false;

    this.init();
  }

  init() {
    const mouseDownEventListener = new GameMouseEventListener(
      new MouseDownEvent(),
      (e) => {
        this.mouseDown = !this.mouseDown;
        document.body.style.cursor = "grabbing";
      }
    );

    const mouseEnterEventListener = new GameMouseEventListener(
      new MouseEnterEvent(),
      (e) => {
        if (this.mouseDown) return;
        document.body.style.cursor = "grab";
      }
    );

    const mouseLeaveEventListener = new GameMouseEventListener(
      new MouseLeaveEvent(),
      (e) => {
        if (this.mouseDown) return;
        document.body.style.cursor = "default";
      }
    );
    const objectFollowCursor = new GameMouseEventListener(
      new MouseMoveEvent(),
      (e: MouseEvent) => {
        this.lastCursorX = e.clientX;
        this.lastCursorY = e.clientY;
        if (this.mouseDown) this.follow();
      }
    );

    this.appendEventListenerToScene(objectFollowCursor);

    this.appendEventListenerToObject(mouseEnterEventListener);
    this.appendEventListenerToObject(mouseLeaveEventListener);
    this.appendEventListenerToObject(mouseDownEventListener);
  }
}

export class FollowCursorOnMoveControl extends AbstractFollowCursorControl {
  constructor(object: GameObject, active = false) {
    super(object, active);

    this.init();
  }

  init() {
    const objectFollowCursor = new GameMouseEventListener(
      new MouseMoveEvent(),
      (e: MouseEvent) => {
        this.lastCursorX = e.clientX;
        this.lastCursorY = e.clientY;
        this.follow();
      }
    );

    this.appendEventListenerToScene(objectFollowCursor);
  }
}

export class JumpYControl extends Control {
  static INITIAL_SPAM_DELAY = 3;
  static INITIAL_DURATION = 500;
  static INITIAL_MAX_JUMPS = 1;
  static INITIAL_VERTICAL_STEP = 3;

  spam1: Spam;
  spam2: Spam;

  maxJumps: number;
  duration: number;
  verticalStep: number;

  constructor(object: GameObject, active = false) {
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
    const keydownEventListener = new GameKeyboardEventListener(
      new KeyDownEvent(" "),
      () => this.handleJump()
    );
    this.appendEventListenerToScene(keydownEventListener);
  }

  async handleJump() {
    const allowed = this.object.requestJump();
    if (!allowed) return;

    await this.spam1.start(this.duration * (3 / 4));
    await this.spam2.start(this.duration * (1 / 4));
  }

  jump(step: number) {
    this.object.up(step);
  }

  setDuration(duration: number) {
    this.duration = duration;
  }

  setSpam75Delay(spamDelay: number) {
    this.spam1.updateDelay(spamDelay);
  }

  setSpam25Delay(spamDelay: number) {
    this.spam2.updateDelay(spamDelay);
  }
}

export class ADControl extends Control {
  spamDelay: number;
  isRunning: boolean;
  isKeyDPressed: boolean;
  isKeyAPressed: boolean;
  goLeftSpam: Spam;
  goRightSpam: Spam;

  constructor(object: GameObject, active = false) {
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
    const keyDownA = new GameKeyboardEventListener(
      new KeyDownEvent("a"),
      () => {
        this.isKeyAPressed = true;
        this.goLeftSpam.start();
      }
    );

    const keyDownD = new GameKeyboardEventListener(
      new KeyDownEvent("d"),
      () => {
        this.isKeyDPressed = true;
        this.goRightSpam.start();
      }
    );

    const keyUpA = new GameKeyboardEventListener(new KeyUpEvent("a"), () => {
      this.goLeftSpam.stop();
      this.isKeyAPressed = false;
      if (!this.isKeyDPressed) this.setIsRunning(false);
    });

    const keyUpD = new GameKeyboardEventListener(new KeyUpEvent("d"), () => {
      this.goRightSpam.stop();
      this.isKeyDPressed = false;
      if (!this.isKeyAPressed) this.setIsRunning(false);
    });

    this.appendEventListenerToScene(keyDownA);
    this.appendEventListenerToScene(keyDownD);

    this.appendEventListenerToScene(keyUpA);
    this.appendEventListenerToScene(keyUpD);
  }

  setIsRunning(val: boolean) {
    if (val === this.isRunning) return;
    this.isRunning = val;
    this.notify(val ? StatusActiveControlEvent : StatusInactiveControlEvent);
  }

  getIsRunning() {
    return this.isRunning;
  }

  updateSpamDelay(spamDelay: number) {
    this.spamDelay = spamDelay;

    this.goLeftSpam.updateDelay(spamDelay);
    this.goRightSpam.updateDelay(spamDelay);
  }
}

export class WSADControl extends Control {
  spamDelay: number;
  goUpSpam: Spam;
  goDownSpam: Spam;
  goLeftSpam: Spam;
  goRightSpam: Spam;

  constructor(object: GameObject, active = false) {
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
    const keyDownW = new GameKeyboardEventListener(
      new KeyDownEvent("w"),
      () => {
        this.goUpSpam.start();
      }
    );

    const keyDownS = new GameKeyboardEventListener(
      new KeyDownEvent("s"),
      () => {
        this.goDownSpam.start();
      }
    );

    const keyDownA = new GameKeyboardEventListener(
      new KeyDownEvent("a"),
      () => {
        this.goLeftSpam.start();
      }
    );

    const keyDownD = new GameKeyboardEventListener(
      new KeyDownEvent("d"),
      () => {
        this.goRightSpam.start();
      }
    );

    const keyUpW = new GameKeyboardEventListener(new KeyUpEvent("w"), () => {
      this.goUpSpam.stop();
    });

    const keyUpS = new GameKeyboardEventListener(new KeyUpEvent("s"), () => {
      this.goDownSpam.stop();
    });

    const keyUpA = new GameKeyboardEventListener(new KeyUpEvent("a"), () => {
      this.goLeftSpam.stop();
    });

    const keyUpD = new GameKeyboardEventListener(new KeyUpEvent("d"), () => {
      this.goRightSpam.stop();
    });

    this.appendEventListenerToScene(keyDownW);
    this.appendEventListenerToScene(keyDownS);
    this.appendEventListenerToScene(keyDownA);
    this.appendEventListenerToScene(keyDownD);

    this.appendEventListenerToScene(keyUpW);
    this.appendEventListenerToScene(keyUpS);
    this.appendEventListenerToScene(keyUpA);
    this.appendEventListenerToScene(keyUpD);
  }

  updateSpeed(speed: number) {
    this.spamDelay = speed;

    this.goUpSpam.updateDelay(speed);
    this.goDownSpam.updateDelay(speed);
    this.goLeftSpam.updateDelay(speed);
    this.goRightSpam.updateDelay(speed);
  }
}
