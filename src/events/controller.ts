export abstract class EventController<EventType> {
  listeners: Map<EventType, Array<Function>> = new Map();

  constructor() {}

  emit(event: EventType, payload: any) {
    if (!this.listeners.has(event)) return;

    for (const callback of this.listeners.get(event)!) {
      callback(payload);
    }
  }

  listen(event: EventType, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)!.push(callback);
  }
}
