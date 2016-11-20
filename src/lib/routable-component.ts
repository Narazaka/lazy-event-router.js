/// <reference types="node" />
import {EventEmitter} from "events";

/**
 * ルーティング可能なコンポーネント
 */
export class RoutableComponent extends EventEmitter {
  private readonly _routes: RoutableComponentRoutes;
  private readonly _controllerClasses: {[name: string]: RoutableComponentControllerConstructor};
  private readonly _controllers: {[name: string]: RoutableComponentController};
  private readonly _components: {[name: string]: EventEmitter | any};
  private readonly _listeners: {[componentName: string]: {[eventName: string]: (() => void)[]}};

  /**
   * constructor
   * @param components コンポーネントの連想配列
   * @param routes ルーティング
   * @param controllerClasses コントローラクラスの連想配列
   */
  constructor(
    components: {[name: string]: EventEmitter | any} = {},
    routes: RoutableComponentRoutes,
    controllerClasses: {[name: string]: RoutableComponentControllerConstructor},
  ) {
    super();
    this._routes = routes;
    this._controllerClasses = controllerClasses;
    this._controllers = {};
    this._components = {};
    this._listeners = {};
    this.registerComponents(components);
  }

  /**
   * Routes
   */
  get routes() { return this._routes; }

  /**
   * Controllers
   */
  get controllers() { return this._controllers; }

  /**
   * Controller classes
   */
  get controllerClasses() { return this._controllerClasses; }

  /**
   * Components
   */
  get components() { return this._components; }

  /**
   * コンポーネントを追加し、ルーティングによるイベントを設定する
   *
   * すでにコンポーネントがあった場合は一度削除してから改めて追加する
   * @param components コンポーネントのリスト
   */
  registerComponents(components: {[name: string]: EventEmitter | any}) {
    for (const name of Object.keys(components)) {
      const component = components[name];
      this.registerComponent(name, component);
    }
  }

  /**
   * コンポーネントを追加し、ルーティングによるイベントを設定する
   *
   * すでにコンポーネントがあった場合は一度削除してから改めて追加する
   * @param name コンポーネント名
   * @param component コンポーネント
   */
  registerComponent(name: string, component: EventEmitter | any) {
    if (this.components[name]) this.unregisterComponent(name);
    this.components[name] = component;
    for (const route of this.routes) {
      if (route.from === name) this._attachRouteEvent(route);
    }
  }

  /**
   * コンポーネントを削除し、ルーティングによるイベントを破棄する
   * @param name コンポーネント名
   */
  unregisterComponent(name: string) {
    if (this.components[name] && this._listeners[name]) {
      const listeners = this._listeners[name];
      for (const event of Object.keys(listeners)) {
        for (const listener of listeners[event]) {
          (<EventEmitter> this.components[name]).removeListener(event, listener);
        }
      }
    }
    delete this.components[name];
    delete this._listeners[name];
  }

  _attachRouteEvent(route: RoutableComponentRoute) {
    const listener = (...args: any[]) => {
      if (!this.controllers[route.controller]) {
        if (!(route.controller in this.controllerClasses)) {
          throw new Error(`controller [${route.controller}] not found`);
        }
        this.controllers[route.controller] =
          new this.controllerClasses[route.controller](this);
      }
      const action = (<any> this.controllers[route.controller])[route.action];
      if (action && action instanceof Function) {
        (<any> this.controllers[route.controller])[route.action](...args); // this維持のため
      } else {
        throw new Error(
          `controller [${route.controller}] does not have action [${route.action}]`
        );
      }
    };
    (<EventEmitter> this.components[route.from]).on(route.event, listener);
    if (!this._listeners[route.from]) this._listeners[route.from] = {};
    if (!this._listeners[route.from][route.event]) this._listeners[route.from][route.event] = [];
    this._listeners[route.from][route.event].push(listener);
  }
}

/** ルーティング設定定義 */
export interface RoutableComponentRouting {
  /**
   * ルーティングをセットアップする
   * @param routes ルーティング設定
   */
  setup(routes: RoutableComponentRoutes): void;
}

export type RoutableComponentRoutingConstructor = new() => RoutableComponentRouting;

/** コントローラ */
export interface RoutableComponentController {
}

export type RoutableComponentControllerConstructor = new(component: RoutableComponent) => RoutableComponentController;

export type RoutesDifiner = (routes: RoutableComponentRoutes) => void;

/**
 * イベントのルーティング設定
 * @notice スレッドセーフではありません
 */
export class RoutableComponentRoutes {
  private readonly _routes: RoutableComponentRoute[];
  private _currentFrom: string;
  private _currentController: string;

  /**
   * コンストラクタ
   * @param routingClasses ルート定義クラス(の配列)
   */
  constructor(routingClasses: RoutableComponentRoutingConstructor | RoutableComponentRoutingConstructor[] = []) {
    this._routes = [];
    this.includeRoute(routingClasses);
  }

  /**
   * ルートを設定する
   * @param routingClasses ルート定義クラス(の配列)
   */
  includeRoute(routingClasses: RoutableComponentRoutingConstructor | RoutableComponentRoutingConstructor[]) {
    const _routingClasses = routingClasses instanceof Array ? routingClasses : [routingClasses];
    for (const routeClass of _routingClasses) {
      const route = new routeClass();
      route.setup(this);
    }
  }

  [Symbol.iterator]() {
    return this._routes[Symbol.iterator]();
  }

  /**
   * from, controllerを前提としてイベントを定義する
   * @param event イベント
   * @param action アクション
   */
  event(event: string, action?: string): void;
  /**
   * fromを前提としてイベントを定義する
   * @param event イベント
   * @param controller コントローラ
   * @param action アクション
   */
  event(event: string, controller: string, action?: string): void;
  /**
   * controllerを前提としてイベントを定義する
   * @param from イベント発生源
   * @param event イベント
   * @param [action] アクション
   */
  event(from: string, event: string, action?: string): void;
  /**
   * 前提なしとしてイベントを定義する
   * @param from イベント発生源
   * @param event イベント
   * @param controller コントローラ
   * @param action アクション
   */
  event(from: string, event: string, controller: string, action?: string): void;
  /**
   * イベントを定義する
   * @param args from, event, controller, action(前提としたものは省く)それぞれの名称文字列
   * @example
   * router.event('shell', 'clicked', 'ShellController', 'shell_clicked'); // full
   * router.event('shell', 'clicked', 'ShellController'); // event = action
   * router.controller('ShellController', function(router) {
   *   router.event('shell', 'clicked'); // controllerは前提があるので省く
   * });
   * router.from('shell', function(router) {
   *   router.controller('ShellController', function(router) {
   *     router.event('clicked'); // from, controllerは前提があるので省く
   *   });
   * });
   */
  event(...args: string[]) {
    if (this._currentFrom && this._currentController) {
      if (args.length > 2) throw new Error("arguments too long");
      this.eventOnFromController(args[0], args[1]);
    } else if (this._currentFrom) {
      if (args.length > 3) throw new Error("arguments too long");
      this.eventOnFrom(args[0], args[1], args[2]);
    } else if (this._currentController) {
      if (args.length > 3) throw new Error("arguments too long");
      this.eventOnController(args[0], args[1], args[2]);
    } else {
      this.eventOnNone(args[0], args[1], args[2], args[3]);
    }
  }

  /**
   * from, controllerを前提としてイベントを定義する
   * @param event イベント
   * @param action アクション
   */
  eventOnFromController(event: string, action: string = event) {
    const from = this._currentFrom;
    const controller = this._currentController;
    this.addRoute(from, event, controller, action);
  }

  /**
   * fromを前提としてイベントを定義する
   * @param event イベント
   * @param controller コントローラ
   * @param action アクション
   */
  eventOnFrom(event: string, controller: string, action: string = event) {
    const from = this._currentFrom;
    this.addRoute(from, event, controller, action);
  }

  /**
   * controllerを前提としてイベントを定義する
   * @param from イベント発生源
   * @param event イベント
   * @param action アクション
   */
  eventOnController(from: string, event: string, action: string = event) {
    const controller = this._currentController;
    this.addRoute(from, event, controller, action);
  }

  /**
   * 前提なしとしてイベントを定義する
   * @param from イベント発生源
   * @param event イベント
   * @param controller コントローラ
   * @param action アクション
   */
  eventOnNone(from: string, event: string, controller: string, action: string = event) {
    this.addRoute(from, event, controller, action);
  }

  /**
   * イベント発生源を前提とする
   * @param from イベント発生源プロパティ名
   * @param block 前提としたイベント発生源におけるルート定義を行う関数
   */
  from(from: string, block: RoutesDifiner) {
    this._currentFrom = from;
    block(this);
    delete this._currentFrom;
  }

  /**
   * コントローラーを前提とする
   * @param controller コントローラ名
   * @param block 前提としたコントローラにおけるルート定義を行う関数
   */
  controller(controller: string, block: RoutesDifiner) {
    this._currentController = controller;
    block(this);
    delete this._currentController;
  }

  /**
   * ルート定義を追加する
   * @param from イベント発生源
   * @param event イベント
   * @param controller コントローラ
   * @param action アクション
   */
  addRoute(from: string, event: string, controller: string, action: string) {
    this._routes.push(new RoutableComponentRoute(from, event, controller, action));
  }

  /**
   * ルーティングの状態を返す
   * @return ルーティングの状態を示す文字列
   */
  toString() {
    return this._routes
      .sort((a, b) =>
        (a.from === b.from ? 0 : a.from > b.from ? 10 : -10)
          + (a.event === b.event ? 0 : a.event > b.event ? 1 : -1)
      )
      .map((route) => route.toString() + "\n")
      .join("");
  }
}

/**
 * ルート
 */
export class RoutableComponentRoute {
  private readonly _from: string;
  private readonly _event: string;
  private readonly _controller: string;
  private readonly _action: string;

  /**
   * コンストラクタ
   * @param from イベント発生源
   * @param event イベント
   * @param controller コントローラ
   * @param action アクション
   */
  constructor(from: string, event: string, controller: string, action: string) {
    this._checkConstructorArguments(from, event, controller, action);
    this._from = from;
    this._event = event;
    this._controller = controller;
    this._action = action;
  }

  _checkConstructorArguments(from: string, event: string, controller: string, action: string) {
    const isString = (obj: any) => typeof obj === "string" || obj instanceof String;
    if (from == null) throw new Error("register routing error: from is empty!");
    if (event == null) throw new Error("register routing error: event is empty!");
    if (controller == null) throw new Error("register routing error: controller is empty!");
    if (action == null) throw new Error("register routing error: action is empty!");
    if (!isString(from) || !isString(event) || !isString(controller) || !isString(action)) {
      throw new Error("register routing error: arguments must be string!");
    }
  }

  /**
   * イベント発生源
   */
  get from() { return this._from; }
  /**
   * イベント
   */
  get event() { return this._event; }
  /**
   * コントローラ
   */
  get controller() { return this._controller; }
  /**
   * アクション
   */
  get action() { return this._action; }

  /**
   * ルーティングの状態を返す
   */
  toString() {
    return `${this.from}.${this.event} => ${this.controller}#${this.action}`;
  }
}
