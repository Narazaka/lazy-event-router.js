import {EventEmitter} from "events";
import {EventRouteSetter} from "./event_route_setter";
import {LazyEventRouter} from "./lazy-event-router";

/** ルーティング設定定義 */
export interface EventRouting {
  /**
   * ルーティングをセットアップする
   * @param routes ルーティング設定
   */
  setup(routes: EventRouteSetter): void;
}

/** ルーティング設定定義クラス */
export type EventRoutingClass = new() => EventRouting;

/** コントローラ */
export interface EventController {
}

/** コントローラクラス */
export type EventControllerClass = new(eventRouterHub: LazyEventRouter) => EventController;

/** イベントを定義するコールバック関数 */
export type EventSetter<T extends EventEmitter, C> = (from: T, controller: C) => void;

/** ルーティングの設定 */
export type RouteSetting = {
  /** イベントソースクラス */
  fromClass: new(...args: any[]) => EventEmitter,
  /** コントローラクラス */
  controllerClass: EventControllerClass,
  /** イベントの定義 */
  setting: EventSetter<EventEmitter, any>,
};

/** イベントの全ルーティング設定 */
export class EventRoutes {
  routeSetter: EventRouteSetter;
  /** ルーティングの設定群 */
  routeSettings: RouteSetting[] = [];

  /**
   * コンストラクタ
   * @param routingClasses ルート定義クラス(の配列)
   */
  constructor(routingClasses: EventRoutingClass | EventRoutingClass[] = []) {
    this.routeSetter = new EventRouteSetter(this);
    this.includeRoute(routingClasses);
  }

  /**
   * ルートを設定する
   * @param routingClasses ルート定義クラス(の配列)
   */
  includeRoute(routingClasses: EventRoutingClass | EventRoutingClass[]) {
    const _routingClasses = routingClasses instanceof Array ? routingClasses : [routingClasses];
    for (const routeClass of _routingClasses) {
      const routing = new routeClass();
      routing.setup(this.routeSetter);
    }
    return this;
  }
}
