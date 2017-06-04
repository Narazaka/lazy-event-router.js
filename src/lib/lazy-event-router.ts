import {EventEmitter} from "events";
import {EventListener, EventRegisterer} from "./event_registerer";
import {EventController, EventControllerClass, EventRoutes, RouteSetting} from "./event_routes";

export * from "./event_registerer";
export * from "./event_route_setter";
export * from "./event_route_setter_with_controller";
export * from "./event_route_setter_with_from";
export * from "./event_routes";

export type ComponentClass<T> = new(...args: any[]) => T;

/**
 * ルーティング可能なコンポーネント
 */
export class LazyEventRouter {
  private readonly _routes: EventRoutes;
  private readonly _controllers: Map<new(eventRouterHub: LazyEventRouter) =>
    EventController, EventController>;
  private readonly _components: Map<new(...args: any[]) => any, any>;
  private readonly _listeners:
    Map<ComponentClass<any>, Map<EventControllerClass<EventController>, {[eventName: string]: EventListener[]}>>;

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
  controller<T>(controllerClass: new(eventRouterHub: LazyEventRouter) => T): T | undefined {
    return this._controllers.get(controllerClass) as T | undefined;
  }

  /**
   * Component
   */
  component<T>(componentClass: ComponentClass<T>): T | undefined {
    return this._components.get(componentClass) as T | undefined;
  }

  /**
   * has Component?
   */
  hasComponent<T>(componentClass: ComponentClass<T>) { return this._components.has(componentClass); }

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
      .filter((routeSetting) => routeSetting.eventSourceClass === component.constructor)
      .forEach((routeSetting) => this._attachRouteEvent(routeSetting));
  }

  /**
   * コンポーネントを削除し、ルーティングによるイベントを破棄する
   * @param componentClass コンポーネントクラス
   */
  unregisterComponent(componentClass: ComponentClass<any>) {
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
    const component = this.component(routeSetting.eventSourceClass) as EventEmitter;
    const controllerClass = routeSetting.controllerClass;
    let controller = this.controller(controllerClass);
    if (!controller) {
      controller = new controllerClass(this);
      bindAll(controller); // イベント定義の便利化とイベント登録解除のため
      this._controllers.set(controllerClass, controller);
    }
    const componentClass = component.constructor as ComponentClass<any>;
    let listenersBycomponent = this._listeners.get(componentClass);
    if (!listenersBycomponent) this._listeners.set(componentClass, (listenersBycomponent = new Map()));
    let listeners = listenersBycomponent.get(controllerClass);
    if (!listeners) listenersBycomponent.set(controllerClass, (listeners = {}));
    const fakeComponent = new EventRegisterer(listeners, component);
    routeSetting.setting(fakeComponent, controller);
  }
}

function allMethods(object: any) {
  const properties: {[property: string]: boolean} = {};
  let prototype = object;
  do {
    for (const property of Object.getOwnPropertyNames(prototype)
      .concat(Object.getOwnPropertySymbols(prototype) as any[])
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
