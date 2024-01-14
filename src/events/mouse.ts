import { GameEvent, GameMouseEventListener, GameListenersList } from ".";

export type MouseEventHtmlName =
  | "mousedown"
  | "mouseup"
  | "mousemove"
  | "mouseenter"
  | "mouseleave"
  | "click";

export abstract class GameMouseEvent extends GameEvent {
  constructor(public htmlName: MouseEventHtmlName) {
    super(htmlName);
  }
}

export class MouseDownEvent extends GameMouseEvent {
  constructor() {
    super("mousedown");
  }
}

export class MouseUpEvent extends GameMouseEvent {
  constructor() {
    super("mouseup");
  }
}

export class MouseMoveEvent extends GameMouseEvent {
  constructor() {
    super("mousemove");
  }
}

export class MouseEnterEvent extends GameMouseEvent {
  constructor() {
    super("mouseenter");
  }
}

export class MouseLeaveEvent extends GameMouseEvent {
  constructor() {
    super("mouseleave");
  }
}

export class MouseClickEvent extends GameMouseEvent {
  constructor() {
    super("click");
  }
}

export class MouseEventsList implements GameListenersList<GameMouseEvent> {
  private listeners: GameMouseEventListener[] = [];
  private callbacks: Map<MouseEventHtmlName, Function[]>;

  static MouseEventHtmlNames: MouseEventHtmlName[] = [
    "mousedown",
    "mouseup",
    "mousemove",
    "mouseenter",
    "mouseleave",
    "click",
  ];

  constructor(
    private parentNode: HTMLElement | Window,
    callbacks = MouseEventsList.generateCallbacksMap()
  ) {
    this.callbacks = callbacks;

    for (const [htmlName, callbacks] of this.callbacks) {
      this.parentNode.addEventListener(htmlName, (e) => {
        for (const callback of callbacks) {
          callback(e);
        }
      });
    }
  }

  static generateCallbacksMap() {
    const map = new Map();
    MouseEventsList.MouseEventHtmlNames.forEach((name) => map.set(name, []));
    return map;
  }

  getListeners() {
    return this.listeners;
  }

  addListener(listener: GameMouseEventListener) {
    this.listeners.push(listener);
    this.callbacks.get(listener.event.htmlName)!.push((e: MouseEvent) => {
      if (listener.active) listener.callback(e);
    });
  }
}
