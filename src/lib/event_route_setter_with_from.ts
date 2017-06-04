import {EventEmitter} from "events";
import {EventRoutes, EventSetter} from "./event_routes";
import {LazyEventRouter} from "./lazy-event-router";

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
