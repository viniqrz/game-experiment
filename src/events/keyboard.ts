import { GameKeyboardEventListener, GameListenersList } from ".";

export enum KeyboardKey {
  W = "w",
  S = "s",
  A = "a",
  D = "d",
  SPACE = " ",
}
export enum GameKeyboardEvent {
  KEYDOWN = "keydown",
  KEYUP = "keyup",
}

export class KeyboardEventsList
  implements GameListenersList<GameKeyboardEvent>
{
  private listeners: GameKeyboardEventListener[] = [];
  private callbacks: Map<
    GameKeyboardEvent,
    Map<KeyboardKey, GameKeyboardEventListener[]>
  >;

  static KeyboardEvents: GameKeyboardEvent[] = [
    GameKeyboardEvent.KEYDOWN,
    GameKeyboardEvent.KEYUP,
  ];
  static KeyboardEventKeys: KeyboardKey[] = [
    KeyboardKey.W,
    KeyboardKey.S,
    KeyboardKey.A,
    KeyboardKey.D,
    KeyboardKey.SPACE,
  ];

  constructor(
    private parentNode: HTMLElement,
    callbacks = KeyboardEventsList.generateCallbacksMap()
  ) {
    this.callbacks = callbacks;

    for (const [type, keysMap] of this.callbacks) {
      this.parentNode.addEventListener(type, (e) => {
        console.log(e.key);
        for (const [key, listeners] of keysMap) {
          if (key === e.key) {
            for (const listener of listeners) {
              if (listener.active) {
                listener.callback(e);
              }
            }
          }
        }
      });
    }
  }

  static generateCallbacksMap() {
    const map = new Map();

    KeyboardEventsList.KeyboardEvents.forEach((name) => {
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

  addListener(listener: GameKeyboardEventListener) {
    this.listeners.push(listener);
    this.callbacks.get(listener.event)!.get(listener.key)!.push(listener);
  }
}
