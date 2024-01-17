import { GameEvent, GameMouseEventListener, GameListenersList } from ".";

export type MouseEventHtmlName =
  | "mousedown"
  | "mouseup"
  | "mousemove"
  | "mouseenter"
  | "mouseleave"
  | "click";

export enum GameMouseEvent {
  DOWN = "mousedown",
  UP = "mouseup",
  MOVE = "mousemove",
  ENTER = "mouseenter",
  LEAVE = "mouseleave",
  CLICK = "click",
}

export class MouseEventsList implements GameListenersList<GameMouseEvent> {
  private listeners: GameMouseEventListener[] = [];
  private callbacks: Map<MouseEventHtmlName, Function[]>;

  static MouseEvents: GameMouseEvent[] = [
    GameMouseEvent.DOWN,
    GameMouseEvent.UP,
    GameMouseEvent.MOVE,
    GameMouseEvent.ENTER,
    GameMouseEvent.LEAVE,
    GameMouseEvent.CLICK,
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
    MouseEventsList.MouseEvents.forEach((name) => map.set(name, []));
    return map;
  }

  getListeners() {
    return this.listeners;
  }

  addListener(listener: GameMouseEventListener) {
    this.listeners.push(listener);
    this.callbacks.get(listener.event)!.push((e: MouseEvent) => {
      if (listener.active) listener.callback(e);
    });
  }
}
