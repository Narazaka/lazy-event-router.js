import {EventEmitter} from "events";
import {EventRouteSetterWithController} from "./event_route_setter_with_controller";
import {EventRouteSetterWithFrom} from "./event_route_setter_with_from";
import {EventControllerClass, EventRoutes, EventSetter, EventSourceClass} from "./event_routes";

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
   * イベントソースを前提とする
   * @param eventSourceClass イベント発生源クラス
   * @param setting イベント定義を行う関数
   */
  from<T extends EventEmitter>(
    eventSourceClass: EventSourceClass<T>,
    setting: (routes: EventRouteSetterWithFrom<T>) => void,
  ) {
    const routes = new EventRouteSetterWithFrom(this._routes, eventSourceClass);
    setting(routes);
    return this;
  }

  /**
   * コントローラーを前提とする
   * @param controllerClass コントローラークラス
   * @param setting イベント定義を行う関数
   */
  controller<C>(
    controllerClass: EventControllerClass<C>,
    setting: (routes: EventRouteSetterWithController<C>) => void,
  ) {
    const routes = new EventRouteSetterWithController(this._routes, controllerClass);
    setting(routes);
    return this;
  }

  /**
   * イベントソースとコントローラーを前提としてイベントを定義する
   * @param eventSourceClass イベントソースクラス
   * @param controllerClass コントローラークラス
   * @param setting イベント定義を行う関数
   */
  fromAndController<T extends EventEmitter, C>(
    eventSourceClass: EventSourceClass<T>,
    controllerClass: EventControllerClass<C>,
    setting: EventSetter<T, C>,
  ) {
    this._routes.routeSettings.push({eventSourceClass, controllerClass, setting});
    return this;
  }
}
