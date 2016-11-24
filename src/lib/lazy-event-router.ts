/// <reference types="node" />
import {EventEmitter} from "events";

/**
 * ルーティング可能なコンポーネント
 */
export class LazyEventRouter {
  private readonly _routes: EventRoutes;
  private readonly _controllers: Map<new(eventRouterHub: LazyEventRouter) =>
    EventController, EventController>;
  private readonly _components: Map<new() => any, any>;
  private readonly _listeners: Map<Function, Map<Function, {[eventName: string]: Function[]}>>;

  /**
   * constructor
   * @param components コンポーネントの配列
   * @param routes ルーティング
   */
  constructor(
    components: any[] = [],
    routes: EventRoutes,
  ) {
    this._routes = routes;
    this._controllers = new Map();
    this._components = new Map();
    this._listeners = new Map();
    this.registerComponents(components);
  }

  /**
   * Routes
   */
  get routes() { return this._routes; }

  /**
   * Controller
   */
  controller<T>(controllerClass: new(eventRouterHub: LazyEventRouter) => T) {
    return <T> this._controllers.get(controllerClass);
  }

  /**
   * Component
   */
  component<T>(componentClass: new() => T) { return <T> this._components.get(componentClass); }

  /**
   * has Component?
   */
  hasComponent<T>(componentClass: new() => T) { return this._components.has(componentClass); }

  /**
   * コンポーネントを追加し、ルーティングによるイベントを設定する
   *
   * すでにコンポーネントがあった場合は一度削除してから改めて追加する
   * @param components コンポーネントのリスト
   */
  registerComponents(components: any[]) {
    for (const component of components) {
      this.registerComponent(component);
    }
  }

  /**
   * コンポーネントを追加し、ルーティングによるイベントを設定する
   *
   * すでに同じクラスのコンポーネントがあった場合は一度削除してから改めて追加する
   * @param component コンポーネント
   */
  registerComponent(component: any) {
    const componentClass = component.constructor;
    if (this.hasComponent(componentClass)) this.unregisterComponent(componentClass);
    this._components.set(componentClass, component);
    this.routes.routeSettings
      .filter((routeSetting) => routeSetting.fromClass === component.constructor)
      .forEach((routeSetting) => this._attachRouteEvent(routeSetting));
  }

  /**
   * コンポーネントを削除し、ルーティングによるイベントを破棄する
   * @param componentClass コンポーネントクラス
   */
  unregisterComponent(componentClass: new() => any) {
    const component = this.component(componentClass);
    const listenersBycomponent = this._listeners.get(componentClass);
    if (component instanceof EventEmitter && listenersBycomponent) {
      for (const listeners of listenersBycomponent.values()) {
        for (const event of Object.keys(listeners)) {
          for (const listener of listeners[event]) {
            component.removeListener(event, listener);
          }
        }
      }
    }
    this._components.delete(componentClass);
    this._listeners.delete(componentClass);
  }

  /**
   * ルーティングの状態を返す
   * @return ルーティングの状態を示す文字列
   */
  toString() {
    const routes: string[] = [];
    for (const [componentClass, listenersBycomponent] of this._listeners.entries()) {
      for (const [controllerClass, listeners] of listenersBycomponent.entries()) {
        for (const event of Object.keys(listeners)) {
          for (const listener of listeners[event]) {
            routes.push(`${componentClass.name}.${event} => ${controllerClass.name}#${listener.name}`);
          }
        }
      }
    }
    return routes.map((route) => route + "\n").join("");
  }

  private _attachRouteEvent(routeSetting: RouteSetting) {
    const component = this.component(routeSetting.fromClass);
    const controllerClass = routeSetting.controllerClass;
    let controller = this.controller(controllerClass);
    if (!controller) {
      controller = new controllerClass(this);
      bindAll(controller); // イベント定義の便利化とイベント登録解除のため
      this._controllers.set(controllerClass, controller);
    }
    const componentClass = component.constructor;
    let listenersBycomponent = this._listeners.get(componentClass);
    if (!listenersBycomponent) this._listeners.set(componentClass, (listenersBycomponent = new Map()));
    let listeners = listenersBycomponent.get(controllerClass);
    if (!listeners) listenersBycomponent.set(controllerClass, (listeners = {}));
    const fakeComponent = new EventRegisterer(listeners, component);
    routeSetting.setting(fakeComponent, controller);
  }
}

class EventRegisterer implements EventEmitter {
  private _allListeners: {[eventName: string]: Function[]};
  private _component: EventEmitter;

  constructor(allListeners: {[eventName: string]: Function[]}, component: EventEmitter) {
    this._allListeners = allListeners;
    this._component = component;
  }

  addListener(event: string | symbol, listener: Function) {
    this._listeners(event).push(listener);
    this._component.addListener(event, listener);
    return this;
  }

  on(event: string | symbol, listener: Function) {
    this._listeners(event).push(listener);
    this._component.on(event, listener);
    return this;
  }

  once(event: string | symbol, listener: Function) {
    this._listeners(event).push(listener);
    this._component.once(event, listener);
    return this;
  }

  prependListener(event: string | symbol, listener: Function) {
    this._listeners(event).unshift(listener);
    this._component.prependListener(event, listener);
    return this;
  }

  prependOnceListener(event: string | symbol, listener: Function) {
    this._listeners(event).unshift(listener);
    this._component.prependOnceListener(event, listener);
    return this;
  }

  removeListener(event: string | symbol, listener: Function) {
    this._component.removeListener(event, listener);
    const listeners = this._listeners(event);
    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
    return this;
  }

  removeAllListeners(event?: string | symbol) {
    this._component.removeAllListeners(event);
    if (event) {
      delete this._allListeners[event];
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

  private _listeners(event: string | symbol) {
    if (!this._allListeners[event]) this._allListeners[event] = [];
    return this._allListeners[event];
  }
}

function allMethods(object: any) {
  const properties: {[property: string]: boolean} = {};
  let prototype = object;
  do {
    for (const property of Object.getOwnPropertyNames(prototype)
      .concat(<any[]> Object.getOwnPropertySymbols(prototype))
    ) {
      if (typeof object[property] === "function") properties[property] = true;
    }
    prototype = Object.getPrototypeOf(prototype);
  } while (Object.getPrototypeOf(prototype));
  return Object.keys(properties);
}

function bindAll(object: any) {
  for (const method of allMethods(object)) {
    object[method] = object[method].bind(object);
  }
}

/** ルーティング設定定義 */
export interface EventRouting {
  /**
   * ルーティングをセットアップする
   * @param routes ルーティング設定
   */
  setup(routes: EventRouteSetter): void;
}

export type EventRoutingConstructor = new() => EventRouting;

/** コントローラ */
export interface EventController {
}

export type EventControllerConstructor = new(eventRouterHub: LazyEventRouter) => EventController;

export type EventSetter<T extends EventEmitter, C> = (from: T, controller: C) => void;

export type RouteSetting = {
  fromClass: new() => EventEmitter,
  controllerClass: new(eventRouterHub: LazyEventRouter) => any,
  setting: EventSetter<EventEmitter, any>,
};

/**
 * イベントのルーティング設定
 */
export class EventRoutes {
  routeSetter: EventRouteSetter;
  routeSettings: RouteSetting[] = [];

  /**
   * コンストラクタ
   * @param routingClasses ルート定義クラス(の配列)
   */
  constructor(routingClasses: EventRoutingConstructor | EventRoutingConstructor[] = []) {
    this.routeSetter = new EventRouteSetter(this);
    this.includeRoute(routingClasses);
  }

  /**
   * ルートを設定する
   * @param routingClasses ルート定義クラス(の配列)
   */
  includeRoute(routingClasses: EventRoutingConstructor | EventRoutingConstructor[]) {
    const _routingClasses = routingClasses instanceof Array ? routingClasses : [routingClasses];
    for (const routeClass of _routingClasses) {
      const route = new routeClass();
      route.setup(this.routeSetter);
    }
    return this;
  }
}

export class EventRouteSetter {
  private _routes: EventRoutes;

  constructor(routes: EventRoutes) {
    this._routes = routes;
  }

  /**
   * イベント発生源を前提とする
   * @param fromClass イベント発生源クラス
   * @param setting イベント定義を行う関数
   */
  from<T extends EventEmitter>(
    fromClass: new(...args: any[]) => T,
    setting: (routes: EventRouteSetterWithFrom<T>) => void,
  ) {
    const routes = new EventRouteSetterWithFrom(this._routes, fromClass);
    setting(routes);
    return this;
  }

  /**
   * controllerを前提とする
   * @param controllerClass コントローラークラス
   * @param setting イベント定義を行う関数
   */
  controller<C>(
    controllerClass: new(eventRouterHub: LazyEventRouter) => C,
    setting: (rotues: EventRouteSetterWithController<C>) => void,
  ) {
    const routes = new EventRouteSetterWithController(this._routes, controllerClass);
    setting(routes);
    return this;
  }

  /**
   * fromとcontrollerを前提としてイベントを定義する
   * @param fromClass イベント発生源クラス
   * @param controllerClass コントローラークラス
   * @param setting イベント定義を行う関数
   */
  fromAndController<T extends EventEmitter, C>(
    fromClass: new(...args: any[]) => T,
    controllerClass: new(eventRouterHub: LazyEventRouter) => C,
    setting: EventSetter<T, C>,
  ) {
    this._routes.routeSettings.push({fromClass, controllerClass, setting});
    return this;
  }
}

export class EventRouteSetterWithFrom<T extends EventEmitter> {
  private _fromClass: new(...args: any[]) => T;
  private _routes: EventRoutes;

  constructor(routes: EventRoutes, fromClass: new(...args: any[]) => T) {
    this._routes = routes;
    this._fromClass = fromClass;
  }

  /**
   * controllerを前提としてイベントを定義する
   * @param controllerClass コントローラークラス
   * @param setting イベント定義を行う関数
   */
  controller<C>(controllerClass: new(eventRouterHub: LazyEventRouter) => C, setting: EventSetter<T, C>) {
    this._routes.routeSettings.push({fromClass: this._fromClass, controllerClass, setting});
  }
}

export class EventRouteSetterWithController<C> {
  private _controllerClass: new(eventRouterHub: LazyEventRouter) => C;
  private _routes: EventRoutes;

  constructor(routes: EventRoutes, controllerClass: new(eventRouterHub: LazyEventRouter) => C) {
    this._routes = routes;
    this._controllerClass = controllerClass;
  }

  /**
   * イベント発生源を前提としてイベントを定義する
   * @param fromClass イベント発生源クラス
   * @param setting イベント定義を行う関数
   */
  from<T extends EventEmitter>(fromClass: new(...args: any[]) => T, setting: EventSetter<T, C>) {
    this._routes.routeSettings.push({fromClass, controllerClass: this._controllerClass, setting});
  }
}
