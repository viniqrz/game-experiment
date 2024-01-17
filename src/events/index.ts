import { GameKeyboardEvent, KeyboardKey } from "./keyboard";
import { GameMouseEvent, MouseEventHtmlName } from "./mouse";

export type GameEvent = GameKeyboardEvent | GameMouseEvent;

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
    public key: KeyboardKey,
    callback: Function,
    active = true
  ) {
    super(event, callback, active);
  }
}

export class GameMouseEventListener extends GameEventListener<GameMouseEvent> {
  constructor(
    public event: GameMouseEvent,
    callback: (e: MouseEvent) => any,
    active = true
  ) {
    super(event, callback, active);
  }
}

export interface GameListenersList<T> {
  getListeners(): GameEventListener<T>[];
  addListener(listener: GameEventListener<T>): void;
}
