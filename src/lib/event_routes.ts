// tslint:disable no-empty-interface
import {EventEmitter} from "events";
import {EventRouteSetter} from "./event_route_setter";
import {LazyEventRouter} from "./lazy-event-router";

/** ルーティング設定定義 */
export interface EventRouting {
  /**
   * ルーティングをセットアップする
   * @param routes ルーティング設定
   */
  setup(eventRouteSetter: EventRouteSetter): void;
}

/** ルーティング設定定義クラス */
export type EventRoutingClass = new() => EventRouting;

/** イベントソースクラス */
export type EventSourceClass<T extends EventEmitter> = new(...args: any[]) => T;

/** コントローラー */
export interface EventController {
}

/** コントローラークラス */
export type EventControllerClass<C extends EventController> = new(lazyEventRouter: LazyEventRouter) => C;

/** イベントを定義するコールバック関数 */
export type EventSetter<T extends EventEmitter, C> = (from: T, controller: C) => void;

/** ルーティングの設定 */
export interface RouteSetting {
  /** イベントソースクラス */
  eventSourceClass: EventSourceClass<EventEmitter>;
  /** コントローラークラス */
  controllerClass: EventControllerClass<EventController>;
  /** イベントの定義 */
  setting: EventSetter<EventEmitter, any>;
}

/** イベントの全ルーティング設定 */
export class EventRoutes {
  routeSetter: EventRouteSetter;
  /** ルーティングの設定群 */
  routeSettings: RouteSetting[] = [];

  /**
   * @param routingClasses ルーティング設定定義クラス(の配列)
   */
  constructor(routingClasses: EventRoutingClass | EventRoutingClass[] = []) {
    this.routeSetter = new EventRouteSetter(this);
    this.includeRoute(routingClasses);
  }

  /**
   * ルーティングを設定する
   * @param routingClasses ルーティング設定定義クラス(の配列)
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
