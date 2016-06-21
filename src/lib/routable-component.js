import {EventEmitter} from 'events';

// shim
require('core-js/fn/array/iterator');
require('core-js/fn/symbol');

/**
 * ルーティング可能なコンポーネント
 */
export class RoutableComponent extends EventEmitter {
  /**
   * constructor
   * @param {Object<EventEmitter>} components components
   */
  constructor(components = {}) {
    super();
    this._components = components;
    this._controllers = {};
  }

  /**
   * Components
   * @type {Hash<EventEmitter>}
   */
  get components() { return this._components; }

  /**
   * Controllers
   * @type {Hash<RoutableComponentController>}
   */
  get controllers() { return this._controllers; }
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

  /**
   * コンポーネントのもつイベント発火要素のイベントにルーティングを設定する
   * @param {RoutableComponent} component コンポーネント
   * @param {Hash<RoutableComponentController>} controller_classes コントローラクラスの連想配列
   * @return {void}
   */
  setup_to(component, controller_classes) {
    this._check_routes_requirements(component, controller_classes);
    for (const route of this._routes) {
      component.components[route.from].on(route.event, (...args) => {
        if (!component.controllers[route.controller]) { // なければコントローラを初期化
          component.controllers[route.controller] =
            new controller_classes[route.controller](component);
        }
        if (!component.controllers[route.controller][route.action]) {
          throw new Error(
            `controller [${route.controller}] does not have action [${route.action}]`
          );
        }
        component.controllers[route.controller][route.action](...args);
      });
    }
  }

  _check_routes_requirements(component, controller_classes) {
    for (const route of this._routes) {
      if (!(route.controller in controller_classes)) {
        throw new Error(`controller [${route.controller}] not found`);
      }
      if (!(route.from in component.components)) {
        throw new Error(`component from [${route.from}] not found`);
      }
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
