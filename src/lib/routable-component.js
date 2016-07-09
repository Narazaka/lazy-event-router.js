import {EventEmitter} from 'events';

/**
 * ルーティング可能なコンポーネント
 */
export class RoutableComponent extends EventEmitter {
  /**
   * constructor
   * @param {Object<EventEmitter>} [components] コンポーネントの連想配列
   * @param {RoutableComponentRoutes} routes ルーティング
   * @param {Object<RoutableComponentController>} controller_classes コントローラクラスの連想配列
   */
  constructor(components, routes, controller_classes) {
    super();
    this._routes = routes;
    this._controller_classes = controller_classes;
    this._controllers = {};
    this._components = {};
    this._listeners = {};
    this.register_components(components);
  }

  /**
   * Routes
   * @type {RoutableComponentRoutes}
   */
  get routes() { return this._routes; }

  /**
   * Controllers
   * @type {Hash<RoutableComponentController>}
   */
  get controllers() { return this._controllers; }

  /**
   * Controller classes
   * @type {Hash<class<RoutableComponentController>>}
   */
  get controller_classes() { return this._controller_classes; }

  /**
   * Components
   * @type {Hash<EventEmitter>}
   */
  get components() { return this._components; }

  /**
   * コンポーネントを追加し、ルーティングによるイベントを設定する
   *
   * すでにコンポーネントがあった場合は一度削除してから改めて追加する
   * @param {Object<RoutableComponent>} components コンポーネントのリスト
   * @return {void}
   */
  register_components(components) {
    for (const name of Object.keys(components)) {
      const component = components[name];
      this.register_component(name, component);
    }
  }

  /**
   * コンポーネントを追加し、ルーティングによるイベントを設定する
   *
   * すでにコンポーネントがあった場合は一度削除してから改めて追加する
   * @param {string} name コンポーネント名
   * @param {RoutableComponent} component コンポーネント
   * @return {void}
   */
  register_component(name, component) {
    if (this.components[name]) this.unregister_component(name);
    this.components[name] = component;
    for (const route of this.routes) {
      if (route.from === name) this._attach_route_event(route);
    }
  }

  /**
   * コンポーネントを削除し、ルーティングによるイベントを破棄する
   * @param {string} name コンポーネント名
   * @return {void}
   */
  unregister_component(name) {
    if (this.components[name] && this._listeners[name]) {
      const listeners = this._listeners[name];
      for (const event of Object.keys(listeners)) {
        for (const listener of listeners[event]) {
          this.components[name].removeListener(event, listener);
        }
      }
    }
    delete this.components[name];
  }

  _attach_route_event(route) {
    const listener = (...args) => {
      if (!this.controllers[route.controller]) {
        if (!(route.controller in this.controller_classes)) {
          throw new Error(`controller [${route.controller}] not found`);
        }
        this.controllers[route.controller] =
          new this.controller_classes[route.controller](this);
      }
      if (!this.controllers[route.controller][route.action]) {
        throw new Error(
          `controller [${route.controller}] does not have action [${route.action}]`
        );
      }
      this.controllers[route.controller][route.action](...args);
    };
    this.components[route.from].on(route.event, listener);
    if (!this._listeners[route.from]) this._listeners[route.from] = {};
    if (!this._listeners[route.from][route.event]) this._listeners[route.from][route.event] = [];
    this._listeners[route.from][route.event].push(listener);
  }
}

/**
 * ルーティング設定定義
 * @interface
 */
export class RoutableComponentRouting {
  /**
   * ルーティングをセットアップする
   * @param {RoutableComponentRoutes} routes ルーティング設定
   * @return {void}
   */
  setup(routes) {
    throw new Error('abstruct');
  }
}

/**
 * コントローラ
 * @interface
 */
export class RoutableComponentController {
  /**
   * コンストラクタ
   * @param {RoutableComponent} component コンポーネント
   */
  constructor(component) {
    throw new Error('abstruct');
  }
}

/**
 * イベントのルーティング設定
 * @notice スレッドセーフではありません
 */
export class RoutableComponentRoutes {
  /**
   * コンストラクタ
   * @param {RoutableComponentRouting|RoutableComponentRouting[]} routing_classes ルート定義クラス(の配列)
   */
  constructor(routing_classes = []) {
    this._routes = [];
    this.include_route(routing_classes);
  }

  /**
   * ルートを設定する
   * @param {Route|Route[]} routing_classes ルート定義クラス(の配列)
   * @return {void}
   */
  include_route(routing_classes) {
    const _routing_classes = routing_classes instanceof Array ? routing_classes : [routing_classes];
    for (const route_class of _routing_classes) {
      const route = new route_class();
      route.setup(this);
    }
  }

  [Symbol.iterator]() {
    return this._routes[Symbol.iterator]();
  }

  /**
   * イベントを定義する
   * @param {...string} args from, event, controller, action(前提としたものは省く)それぞれの名称文字列
   * @return {void}
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
  event(...args) {
    if (this._current_from && this._current_controller) {
      if (args.length > 2) throw new Error('arguments too long');
      this.event_on_from_controller(...args);
    } else if (this._current_from) {
      if (args.length > 3) throw new Error('arguments too long');
      this.event_on_from(...args);
    } else if (this._current_controller) {
      if (args.length > 3) throw new Error('arguments too long');
      this.event_on_controller(...args);
    } else {
      this.event_on_none(...args);
    }
  }

  /**
   * from, controllerを前提としてイベントを定義する
   * @param {string} event イベント
   * @param {string} [action] アクション
   * @return {void}
   */
  event_on_from_controller(event, action = event) {
    const from = this._current_from;
    const controller = this._current_controller;
    this.add_route(from, event, controller, action);
  }

  /**
   * fromを前提としてイベントを定義する
   * @param {string} event イベント
   * @param {string} controller コントローラ
   * @param {string} [action] アクション
   * @return {void}
   */
  event_on_from(event, controller, action = event) {
    const from = this._current_from;
    this.add_route(from, event, controller, action);
  }

  /**
   * controllerを前提としてイベントを定義する
   * @param {string} from イベント発生源
   * @param {string} event イベント
   * @param {string} [action] アクション
   * @return {void}
   */
  event_on_controller(from, event, action = event) {
    const controller = this._current_controller;
    this.add_route(from, event, controller, action);
  }

  /**
   * 前提なしとしてイベントを定義する
   * @param {string} from イベント発生源
   * @param {string} event イベント
   * @param {string} controller コントローラ
   * @param {string} [action] アクション
   * @return {void}
   */
  event_on_none(from, event, controller, action = event) {
    this.add_route(from, event, controller, action);
  }

  /**
   * イベント発生源を前提とする
   * @param {string} from イベント発生源プロパティ名
   * @param {Function} block 前提としたイベント発生源におけるルート定義を行う関数
   * @return {void}
   */
  from(from, block) {
    this._current_from = from;
    block(this);
    delete this._current_from;
  }

  /**
   * コントローラーを前提とする
   * @param {string} controller コントローラ名
   * @param {Function} block 前提としたコントローラにおけるルート定義を行う関数
   * @return {void}
   */
  controller(controller, block) {
    this._current_controller = controller;
    block(this);
    delete this._current_controller;
  }

  /**
   * ルート定義を追加する
   * @param {string} from イベント発生源
   * @param {string} event イベント
   * @param {string} controller コントローラ
   * @param {string} action アクション
   * @return {void}
   */
  add_route(from, event, controller, action) {
    this._routes.push(new RoutableComponentRoute(from, event, controller, action));
  }

  /**
   * ルーティングの状態を返す
   * @return {string} ルーティングの状態を示す文字列
   */
  toString() {
    return this._routes
      .sort((a, b) =>
        (a.from === b.from ? 0 : a.from > b.from ? 10 : -10)
          + (a.event === b.event ? 0 : a.event > b.event ? 1 : -1)
      )
      .map((route) => route.toString() + '\n')
      .join('');
  }
}

/**
 * ルート
 */
export class RoutableComponentRoute {
  /**
   * コンストラクタ
   * @param {string} from イベント発生源
   * @param {string} event イベント
   * @param {string} controller コントローラ
   * @param {string} action アクション
   */
  constructor(from, event, controller, action) {
    this._check_constructor_arguments(from, event, controller, action);
    this._from = from;
    this._event = event;
    this._controller = controller;
    this._action = action;
  }

  _check_constructor_arguments(from, event, controller, action) {
    const isString = (obj) => typeof obj === 'string' || obj instanceof String;
    if (from == null) throw new Error('register routing error: from is empty!');
    if (event == null) throw new Error('register routing error: event is empty!');
    if (controller == null) throw new Error('register routing error: controller is empty!');
    if (action == null) throw new Error('register routing error: action is empty!');
    if (!isString(from) || !isString(event) || !isString(controller) || !isString(action)) {
      throw new Error('register routing error: arguments must be string!');
    }
  }

  /**
   * イベント発生源
   * @type {string}
   */
  get from() { return this._from; }
  /**
   * イベント
   * @type {string}
   */
  get event() { return this._event; }
  /**
   * コントローラ
   * @type {string}
   */
  get controller() { return this._controller; }
  /**
   * アクション
   * @type {string}
   */
  get action() { return this._action; }

  /**
   * ルーティングの状態を返す
   * @return {string} ルーティングの状態を示す文字列
   */
  toString() {
    return `${this.from}.${this.event} => ${this.controller}#${this.action}`;
  }
}
