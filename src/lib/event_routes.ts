// tslint:disable no-empty-interface
import {EventEmitter} from "events";
import {EventRouteSetter} from "./event_route_setter";
import {LazyEventRouter} from "./lazy-event-router";

/** ルーティング設定定義 */
export type EventRoutingDefiner =
  /**
   * @param eventRouteSetter ルーティング設定
   */
  (eventRouteSetter: EventRouteSetter) => void;

/** コンポーネントクラス */
export type ComponentClass<T> = new(...args: any[]) => T;

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
   * @param routingClasses ルーティング設定定義(の配列)
   */
  constructor(eventRoutingDefiners: EventRoutingDefiner | EventRoutingDefiner[] = []) {
    this.routeSetter = new EventRouteSetter(this);
    this.includeRoute(eventRoutingDefiners);
  }

  /**
   * ルーティングを設定する
   * @param routingClasses ルーティング設定定義(の配列)
   */
  includeRoute(eventRoutingDefiners: EventRoutingDefiner | EventRoutingDefiner[]) {
    const _eventRoutingDefiners = eventRoutingDefiners instanceof Array ? eventRoutingDefiners : [eventRoutingDefiners];
    for (const eventRoutingDefiner of _eventRoutingDefiners) {
      eventRoutingDefiner(this.routeSetter);
    }
    return this;
  }
}
