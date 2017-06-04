import {EventEmitter} from "events";
import {EventControllerClass, EventRoutes, EventSetter, EventSourceClass} from "./event_routes";

export class EventRouteSetterWithController<C> {
  private _controllerClass: EventControllerClass<C>;
  private _routes: EventRoutes;

  constructor(routes: EventRoutes, controllerClass: EventControllerClass<C>) {
    this._routes = routes;
    this._controllerClass = controllerClass;
  }

  /**
   * イベントソースを前提としてイベントを定義する
   * @param eventSourceClass イベントソースクラス
   * @param setting イベント定義を行う関数
   */
  from<T extends EventEmitter>(eventSourceClass: EventSourceClass<T>, setting: EventSetter<T, C>) {
    this._routes.routeSettings.push({eventSourceClass, controllerClass: this._controllerClass, setting});
  }
}
