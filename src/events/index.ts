import { KeyboardEventHtmlName } from "./keyboard";
import { MouseEventHtmlName } from "./mouse";

export abstract class GameEvent {
  public static htmlName: KeyboardEventHtmlName | MouseEventHtmlName;

  constructor(public htmlName: string, public active = true) {}

  setActive(active: boolean) {
    this.active = active;
  }
}

export class GameEventListener<T> {
  constructor(
    public event: T,
    public callback: Function,
    public active = true
  ) {}
}

export interface GameListenersList<T> {
  getListeners(): GameEventListener<T>[];
  addListener(listener: GameEventListener<T>): void;
}
