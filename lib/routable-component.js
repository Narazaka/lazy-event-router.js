/* (C) 2016 Narazaka : Licensed under The MIT License - https://narazaka.net/license/MIT?2016 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RoutableComponentRoute = exports.RoutableComponentRoutes = exports.RoutableComponentController = exports.RoutableComponentRouting = exports.RoutableComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// shim
require('core-js/fn/array/iterator');
require('core-js/fn/symbol');

/**
 * ルーティング可能なコンポーネント
 */

var RoutableComponent = exports.RoutableComponent = function (_EventEmitter) {
  _inherits(RoutableComponent, _EventEmitter);

  /**
   * constructor
   * @param {Object<EventEmitter>} components components
   */

  function RoutableComponent() {
    var components = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, RoutableComponent);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RoutableComponent).call(this));

    _this._components = components;
    _this._controllers = {};
    return _this;
  }

  /**
   * Components
   * @type {Hash<EventEmitter>}
   */


  _createClass(RoutableComponent, [{
    key: 'components',
    get: function get() {
      return this._components;
    }

    /**
     * Controllers
     * @type {Hash<RoutableComponentController>}
     */

  }, {
    key: 'controllers',
    get: function get() {
      return this._controllers;
    }
  }]);

  return RoutableComponent;
}(_events.EventEmitter);

/**
 * ルーティング設定定義
 * @interface
 */


var RoutableComponentRouting = exports.RoutableComponentRouting = function () {
  function RoutableComponentRouting() {
    _classCallCheck(this, RoutableComponentRouting);
  }

  _createClass(RoutableComponentRouting, [{
    key: 'setup',

    /**
     * ルーティングをセットアップする
     * @param {RoutableComponentRoutes} routes ルーティング設定
     * @return {void}
     */
    value: function setup(routes) {
      throw new Error('abstruct');
    }
  }]);

  return RoutableComponentRouting;
}();

/**
 * コントローラ
 * @interface
 */


var RoutableComponentController =
/**
 * コンストラクタ
 * @param {RoutableComponent} component コンポーネント
 */
exports.RoutableComponentController = function RoutableComponentController(component) {
  _classCallCheck(this, RoutableComponentController);

  throw new Error('abstruct');
};

/**
 * イベントのルーティング設定
 * @notice スレッドセーフではありません
 */


var RoutableComponentRoutes = function () {
  /**
   * コンストラクタ
   * @param {RoutableComponentRouting|RoutableComponentRouting[]} routing_classes ルート定義クラス(の配列)
   */

  function RoutableComponentRoutes() {
    var routing_classes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, RoutableComponentRoutes);

    this._routes = [];
    this.include_route(routing_classes);
  }

  /**
   * ルートを設定する
   * @param {Route|Route[]} routing_classes ルート定義クラス(の配列)
   * @return {void}
   */


  _createClass(RoutableComponentRoutes, [{
    key: 'include_route',
    value: function include_route(routing_classes) {
      var _routing_classes = routing_classes instanceof Array ? routing_classes : [routing_classes];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _routing_classes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var route_class = _step.value;

          var route = new route_class();
          route.setup(this);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * コンポーネントのもつイベント発火要素のイベントにルーティングを設定する
     * @param {RoutableComponent} component コンポーネント
     * @param {Hash<RoutableComponentController>} controller_classes コントローラクラスの連想配列
     * @return {void}
     */

  }, {
    key: 'setup_to',
    value: function setup_to(component, controller_classes) {
      this._check_routes_requirements(component, controller_classes);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        var _loop = function _loop() {
          var route = _step2.value;

          component.components[route.from].on(route.event, function () {
            var _component$controller;

            if (!component.controllers[route.controller]) {
              // なければコントローラを初期化
              component.controllers[route.controller] = new controller_classes[route.controller](component);
            }
            if (!component.controllers[route.controller][route.action]) {
              throw new Error('controller [' + route.controller + '] does not have action [' + route.action + ']');
            }
            (_component$controller = component.controllers[route.controller])[route.action].apply(_component$controller, arguments);
          });
        };

        for (var _iterator2 = this._routes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: '_check_routes_requirements',
    value: function _check_routes_requirements(component, controller_classes) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this._routes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _route = _step3.value;

          if (!(_route.controller in controller_classes)) {
            throw new Error('controller [' + _route.controller + '] not found');
          }
          if (!(_route.from in component.components)) {
            throw new Error('component from [' + _route.from + '] not found');
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: Symbol.iterator,
    value: function value() {
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

  }, {
    key: 'event',
    value: function event() {
      if (this._current_from && this._current_controller) {
        if (arguments.length > 2) throw new Error('arguments too long');
        this.event_on_from_controller.apply(this, arguments);
      } else if (this._current_from) {
        if (arguments.length > 3) throw new Error('arguments too long');
        this.event_on_from.apply(this, arguments);
      } else if (this._current_controller) {
        if (arguments.length > 3) throw new Error('arguments too long');
        this.event_on_controller.apply(this, arguments);
      } else {
        this.event_on_none.apply(this, arguments);
      }
    }

    /**
     * from, controllerを前提としてイベントを定義する
     * @param {string} event イベント
     * @param {string} [action] アクション
     * @return {void}
     */

  }, {
    key: 'event_on_from_controller',
    value: function event_on_from_controller(event) {
      var action = arguments.length <= 1 || arguments[1] === undefined ? event : arguments[1];

      var from = this._current_from;
      var controller = this._current_controller;
      this.add_route(from, event, controller, action);
    }

    /**
     * fromを前提としてイベントを定義する
     * @param {string} event イベント
     * @param {string} controller コントローラ
     * @param {string} [action] アクション
     * @return {void}
     */

  }, {
    key: 'event_on_from',
    value: function event_on_from(event, controller) {
      var action = arguments.length <= 2 || arguments[2] === undefined ? event : arguments[2];

      var from = this._current_from;
      this.add_route(from, event, controller, action);
    }

    /**
     * controllerを前提としてイベントを定義する
     * @param {string} from イベント発生源
     * @param {string} event イベント
     * @param {string} [action] アクション
     * @return {void}
     */

  }, {
    key: 'event_on_controller',
    value: function event_on_controller(from, event) {
      var action = arguments.length <= 2 || arguments[2] === undefined ? event : arguments[2];

      var controller = this._current_controller;
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

  }, {
    key: 'event_on_none',
    value: function event_on_none(from, event, controller) {
      var action = arguments.length <= 3 || arguments[3] === undefined ? event : arguments[3];

      this.add_route(from, event, controller, action);
    }

    /**
     * イベント発生源を前提とする
     * @param {string} from イベント発生源プロパティ名
     * @param {Function} block 前提としたイベント発生源におけるルート定義を行う関数
     * @return {void}
     */

  }, {
    key: 'from',
    value: function from(_from, block) {
      this._current_from = _from;
      block(this);
      delete this._current_from;
    }

    /**
     * コントローラーを前提とする
     * @param {string} controller コントローラ名
     * @param {Function} block 前提としたコントローラにおけるルート定義を行う関数
     * @return {void}
     */

  }, {
    key: 'controller',
    value: function controller(_controller, block) {
      this._current_controller = _controller;
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

  }, {
    key: 'add_route',
    value: function add_route(from, event, controller, action) {
      this._routes.push(new RoutableComponentRoute(from, event, controller, action));
    }

    /**
     * ルーティングの状態を返す
     * @return {string} ルーティングの状態を示す文字列
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this._routes.sort(function (a, b) {
        return (a.from === b.from ? 0 : a.from > b.from ? 10 : -10) + (a.event === b.event ? 0 : a.event > b.event ? 1 : -1);
      }).map(function (route) {
        return route.toString() + '\n';
      }).join('');
    }
  }]);

  return RoutableComponentRoutes;
}();

/**
 * ルート
 */


exports.RoutableComponentRoutes = RoutableComponentRoutes;

var RoutableComponentRoute = exports.RoutableComponentRoute = function () {
  /**
   * コンストラクタ
   * @param {string} from イベント発生源
   * @param {string} event イベント
   * @param {string} controller コントローラ
   * @param {string} action アクション
   */

  function RoutableComponentRoute(from, event, controller, action) {
    _classCallCheck(this, RoutableComponentRoute);

    this._check_constructor_arguments(from, event, controller, action);
    this._from = from;
    this._event = event;
    this._controller = controller;
    this._action = action;
  }

  _createClass(RoutableComponentRoute, [{
    key: '_check_constructor_arguments',
    value: function _check_constructor_arguments(from, event, controller, action) {
      var isString = function isString(obj) {
        return typeof obj === 'string' || obj instanceof String;
      };
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

  }, {
    key: 'toString',


    /**
     * ルーティングの状態を返す
     * @return {string} ルーティングの状態を示す文字列
     */
    value: function toString() {
      return this.from + '.' + this.event + ' => ' + this.controller + '#' + this.action;
    }
  }, {
    key: 'from',
    get: function get() {
      return this._from;
    }
    /**
     * イベント
     * @type {string}
     */

  }, {
    key: 'event',
    get: function get() {
      return this._event;
    }
    /**
     * コントローラ
     * @type {string}
     */

  }, {
    key: 'controller',
    get: function get() {
      return this._controller;
    }
    /**
     * アクション
     * @type {string}
     */

  }, {
    key: 'action',
    get: function get() {
      return this._action;
    }
  }]);

  return RoutableComponentRoute;
}();
//# sourceMappingURL=routable-component.js.map