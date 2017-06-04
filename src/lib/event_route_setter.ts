import {EventEmitter} from "events";
import {EventRouteSetterWithController} from "./event_route_setter_with_controller";
import {EventRouteSetterWithFrom} from "./event_route_setter_with_from";
import {EventRoutes, EventSetter} from "./event_routes";
import {LazyEventRouter} from "./lazy-event-router";

/** イベントのルーティングを設定する補助クラス */
export class EventRouteSetter {
  private _routes: EventRoutes;

  /**
   * @param routes イベントの全ルーティング設定
   */
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
    setting: (routes: EventRouteSetterWithController<C>) => void,
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
