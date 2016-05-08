/* (C) 2016 Narazaka : Licensed under The MIT License - https://narazaka.net/license/MIT?2016 */
var routableComponent =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.RoutableComponentRoute = exports.RoutableComponentRoutes = exports.RoutableComponentController = exports.RoutableComponentRouting = exports.RoutableComponent = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _events = __webpack_require__(1);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	/**
	 * ルーティング可能なコンポーネント
	 */
	
	var RoutableComponent = exports.RoutableComponent = function (_EventEmitter) {
	  _inherits(RoutableComponent, _EventEmitter);
	
	  function RoutableComponent() {
	    _classCallCheck(this, RoutableComponent);
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RoutableComponent).call(this));
	
	    _this._models = {};
	    _this._controllers = {};
	    return _this;
	  }
	
	  /**
	   * Models
	   * @type {Hash<Object>}
	   */
	
	
	  _createClass(RoutableComponent, [{
	    key: 'models',
	    get: function get() {
	      return this._models;
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
	
	          component[route.from].on(route.event, function () {
	            var _component$controller;
	
	            if (!component.controllers[route.controller]) {
	              // なければコントローラを初期化
	              component.controllers[route.controller] = new controller_classes[route.controller](component);
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
	          if (!(_route.from in component)) {
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
	
	    // [Symbol.iterator]() {
	    //   return this._routes[Symbol.iterator]();
	    // }
	
	    /**
	     * イベントを定義する
	     * @param {...string} args from, event, controller, action(前提としたものは省く)それぞれの名称文字列
	     * @return {void}
	     * @example
	     * router.event('shell', 'clicked', 'ShellController', 'shell_clicked') // full
	     * router.event('shell', 'clicked', 'ShellController') // event = action
	     * router.controller('ShellController', function(router) {
	     *   router.event('shell', 'clicked') // controllerは前提があるので省く
	     * });
	     * router.from('shell', function(router) {
	     *   router.controller('ShellController', function(router) {
	     *     router.event('clicked') // from, controllerは前提があるので省く
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

/***/ },
/* 1 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;
	
	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;
	
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;
	
	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;
	
	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};
	
	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;
	
	  if (!this._events)
	    this._events = {};
	
	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }
	
	  handler = this._events[type];
	
	  if (isUndefined(handler))
	    return false;
	
	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }
	
	  return true;
	};
	
	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;
	
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  if (!this._events)
	    this._events = {};
	
	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);
	
	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];
	
	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }
	
	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.on = EventEmitter.prototype.addListener;
	
	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  var fired = false;
	
	  function g() {
	    this.removeListener(type, g);
	
	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }
	
	  g.listener = listener;
	  this.on(type, g);
	
	  return this;
	};
	
	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;
	
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  if (!this._events || !this._events[type])
	    return this;
	
	  list = this._events[type];
	  length = list.length;
	  position = -1;
	
	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	
	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }
	
	    if (position < 0)
	      return this;
	
	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }
	
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;
	
	  if (!this._events)
	    return this;
	
	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }
	
	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }
	
	  listeners = this._events[type];
	
	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];
	
	  return this;
	};
	
	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};
	
	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];
	
	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};
	
	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};
	
	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	
	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	
	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ }
/******/ ]);
//# sourceMappingURL=routable-component.js.map