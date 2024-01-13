import { GameEvent, GameEventListener, GameListenersList } from ".";

export type KeyboardKey = "w" | "s" | "a" | "d" | " ";
export type KeyboardEventHtmlName = "keydown" | "keyup";

export abstract class GameKeyboardEvent extends GameEvent {
  constructor(public key: KeyboardKey, public htmlName: KeyboardEventHtmlName) {
    super(htmlName);
  }
}

export class KeyDownEvent extends GameKeyboardEvent {
  constructor(key: KeyboardKey) {
    super(key, "keydown");
  }
}

export class KeyUpEvent extends GameKeyboardEvent {
  constructor(key: KeyboardKey) {
    super(key, "keyup");
  }
}

export class KeyboardEventsList
  implements GameListenersList<GameKeyboardEvent>
{
  private listeners: GameEventListener<GameKeyboardEvent>[] = [];
  private callbacks: Map<
    KeyboardEventHtmlName,
    Map<KeyboardKey, GameEventListener<GameKeyboardEvent>[]>
  >;

  static KeyboardEventHtmlNames: KeyboardEventHtmlName[] = ["keydown", "keyup"];
  static KeyboardEventKeys: KeyboardKey[] = ["w", "s", "a", "d", " "];

  constructor(
    private parentNode: HTMLElement,
    callbacks = KeyboardEventsList.generateCallbacksMap()
  ) {
    this.callbacks = callbacks;

    for (const [type, keysMap] of this.callbacks) {
      this.parentNode.addEventListener(type, (e) => {
        console.log(e.key);
        for (const [key, events] of keysMap) {
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

  static generateCallbacksMap() {
    const map = new Map();

    KeyboardEventsList.KeyboardEventHtmlNames.forEach((name) => {
      map.set(name, new Map());

      KeyboardEventsList.KeyboardEventKeys.forEach((key) => {
        map.get(name).set(key, []);
      });
    });

    return map;
  }

  getListeners() {
    return this.listeners;
  }

  addListener(listener: GameEventListener<GameKeyboardEvent>) {
    this.listeners.push(listener);
    this.callbacks
      .get(listener.event.htmlName)!
      .get(listener.event.key)!
      .push(listener);
  }
}
