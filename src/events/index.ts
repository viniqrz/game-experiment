import { GameKeyboardEvent, KeyboardEventHtmlName } from "./keyboard";
import { GameMouseEvent, MouseEventHtmlName } from "./mouse";

export abstract class GameEvent {
  public static htmlName: KeyboardEventHtmlName | MouseEventHtmlName;

  constructor(public htmlName: string) {}
}

abstract class GameEventListener<T> {
  constructor(
    public event: T,
    public callback: Function,
    public active = true
  ) {}

  getActive() {
    return this.active;
  }

  setActive(active: boolean) {
    this.active = active;
  }
}

export class GameKeyboardEventListener extends GameEventListener<GameKeyboardEvent> {
  constructor(
    public event: GameKeyboardEvent,
    callback: Function,
    active = true
  ) {
    super(event, callback, active);
  }
}

export class GameMouseEventListener extends GameEventListener<GameMouseEvent> {
  constructor(public event: GameMouseEvent, callback: Function, active = true) {
    super(event, callback, active);
  }
}

export interface GameListenersList<T> {
  getListeners(): GameEventListener<T>[];
  addListener(listener: GameEventListener<T>): void;
}
