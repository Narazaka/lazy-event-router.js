import {EventEmitter} from "events";
import {EventControllerClass, EventRoutes, EventSetter, EventSourceClass} from "./event_routes";

export class EventRouteSetterWithFrom<T extends EventEmitter> {
  private _sourceClass: EventSourceClass<T>;
  private _routes: EventRoutes;

  constructor(routes: EventRoutes, sourceClass: EventSourceClass<T>) {
    this._routes = routes;
    this._sourceClass = sourceClass;
  }

  /**
   * controllerを前提としてイベントを定義する
   * @param controllerClass コントローラークラス
   * @param setting イベント定義を行う関数
   */
  controller<C>(controllerClass: EventControllerClass<C>, setting: EventSetter<T, C>) {
    this._routes.routeSettings.push({sourceClass: this._sourceClass, controllerClass, setting});
  }
}
