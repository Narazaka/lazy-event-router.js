import {EventEmitter} from "events";
import {EventRoutes, EventSetter} from "./event_routes";
import {LazyEventRouter} from "./lazy-event-router";

export class EventRouteSetterWithController<C> {
  private _controllerClass: new(eventRouterHub: LazyEventRouter) => C;
  private _routes: EventRoutes;

  constructor(routes: EventRoutes, controllerClass: new(eventRouterHub: LazyEventRouter) => C) {
    this._routes = routes;
    this._controllerClass = controllerClass;
  }

  /**
   * イベント発生源を前提としてイベントを定義する
   * @param fromClass イベント発生源クラス
   * @param setting イベント定義を行う関数
   */
  from<T extends EventEmitter>(fromClass: new(...args: any[]) => T, setting: EventSetter<T, C>) {
    this._routes.routeSettings.push({fromClass, controllerClass: this._controllerClass, setting});
  }
}
