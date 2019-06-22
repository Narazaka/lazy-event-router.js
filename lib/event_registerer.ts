import {EventEmitter} from "events";

export type EventListener = (...args: any[]) => void;

export class EventRegisterer implements EventEmitter {
  private _allListeners: {[eventName: string]: EventListener[]};
  private _component: EventEmitter;

  constructor(allListeners: {[eventName: string]: EventListener[]}, component: EventEmitter) {
    this._allListeners = allListeners;
    this._component = component;
  }

  addListener(event: string | symbol, listener: EventListener) {
    this._listeners(event).push(listener);
    this._component.addListener(event, listener);
    return this;
  }

  on(event: string | symbol, listener: EventListener) {
    this._listeners(event).push(listener);
    this._component.on(event, listener);
    return this;
  }

  once(event: string | symbol, listener: EventListener) {
    this._listeners(event).push(listener);
    this._component.once(event, listener);
    return this;
  }

  prependListener(event: string | symbol, listener: EventListener) {
    this._listeners(event).unshift(listener);
    this._component.prependListener(event, listener);
    return this;
  }

  prependOnceListener(event: string | symbol, listener: EventListener) {
    this._listeners(event).unshift(listener);
    this._component.prependOnceListener(event, listener);
    return this;
  }

  off(event: string | symbol, listener: EventListener) {
    this._component.off(event, listener);
    const listeners = this._listeners(event);
    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
    return this;
  }

  removeListener(event: string | symbol, listener: EventListener) {
    this._component.removeListener(event, listener);
    const listeners = this._listeners(event);
    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
    return this;
  }

  removeAllListeners(event?: string | symbol) {
    this._component.removeAllListeners(event);
    if (event) {
      delete this._allListeners[event as string];
    } else {
      for (const _event of Object.keys(this._allListeners)) {
        delete this._allListeners[_event];
      }
    }
    return this;
  }

  setMaxListeners(n: number) {
    this._component.setMaxListeners(n);
    return this;
  }

  getMaxListeners() {
    return this._component.getMaxListeners();
  }

  listeners(event: string | symbol) {
    return this._component.listeners(event);
  }

  emit(event: string | symbol, ...args: any[]) {
    return this._component.emit(event, ...args);
  }

  eventNames() {
    return this._component.eventNames();
  }

  listenerCount(event: string | symbol) {
    return this._component.listenerCount(event);
  }

  rawListeners(event: string | symbol) {
    return this._component.rawListeners(event);
  }

  private _listeners(event: string | symbol) {
    if (!this._allListeners[event as string]) this._allListeners[event as string] = [];
    return this._allListeners[event as string];
  }
}
