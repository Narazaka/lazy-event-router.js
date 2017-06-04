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
   * イベント発生源を前提とする
   * @param sourceClass イベント発生源クラス
   * @param setting イベント定義を行う関数
   */
  from<T extends EventEmitter>(
    sourceClass: EventSourceClass<T>,
    setting: (routes: EventRouteSetterWithFrom<T>) => void,
  ) {
    const routes = new EventRouteSetterWithFrom(this._routes, sourceClass);
    setting(routes);
    return this;
  }

  /**
   * controllerを前提とする
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
   * fromとcontrollerを前提としてイベントを定義する
   * @param sourceClass イベント発生源クラス
   * @param controllerClass コントローラークラス
   * @param setting イベント定義を行う関数
   */
  fromAndController<T extends EventEmitter, C>(
    sourceClass: EventSourceClass<T>,
    controllerClass: EventControllerClass<C>,
    setting: EventSetter<T, C>,
  ) {
    this._routes.routeSettings.push({sourceClass, controllerClass, setting});
    return this;
  }
}
