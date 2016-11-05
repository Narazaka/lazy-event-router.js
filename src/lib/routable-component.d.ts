/// <reference types="node" />
import {EventEmitter} from 'events';

/**
 * ルーティング可能なコンポーネント
 */
export class RoutableComponent extends EventEmitter {
  /**
   * constructor
   * @param components コンポーネントの連想配列
   * @param routes ルーティング
   * @param controllerClasses コントローラクラスの連想配列
   */
  constructor(
    components: {[name: string]: EventEmitter},
    routes: RoutableComponentRoutes,
    controllerClasses: {[name: string]: RoutableComponentControllerConstructor},
  );

  /**
   * Routes
   */
  readonly routes: RoutableComponentRoutes;

  /**
   * Controllers
   */
  readonly controllers: {[name: string]: RoutableComponentController};

  /**
   * Controller classes
   */
  readonly controllerClasses: {[name: string]: RoutableComponentControllerConstructor};

  /**
   * Components
   */
  readonly components: {[name: string]: EventEmitter};

  /**
   * コンポーネントを追加し、ルーティングによるイベントを設定する
   *
   * すでにコンポーネントがあった場合は一度削除してから改めて追加する
   * @param components コンポーネントのリスト
   */
  registerComponents(components: {[name: string]: EventEmitter}): void;

  /**
   * コンポーネントを追加し、ルーティングによるイベントを設定する
   *
   * すでにコンポーネントがあった場合は一度削除してから改めて追加する
   * @param name コンポーネント名
   * @param component コンポーネント
   */
  registerComponent(name: string, component: EventEmitter): void;

  /**
   * コンポーネントを削除し、ルーティングによるイベントを破棄する
   * @param name コンポーネント名
   */
  unregisterComponent(name: string): void;
}

/**
 * ルーティング設定定義
 */
export interface RoutableComponentRouting {
  /**
   * ルーティングをセットアップする
   * @param routes ルーティング設定
   */
  setup(routes: RoutableComponentRoutes): void;
}

type RoutableComponentRoutingConstructor = new() => RoutableComponentRouting;

/**
 * コントローラ
 */
export interface RoutableComponentController {
}

type RoutableComponentControllerConstructor = new(component: RoutableComponent) => RoutableComponentController;

/**
 * イベントのルーティング設定
 * @notice スレッドセーフではありません
 */
export class RoutableComponentRoutes {
  /**
   * コンストラクタ
   * @param routingClasses ルート定義クラス(の配列)
   */
  constructor(routingClasses?: RoutableComponentRouting | RoutableComponentRouting[]);

  /**
   * ルートを設定する
   * @param routingClasses ルート定義クラス(の配列)
   */
  includeRoute(routingClasses: RoutableComponentRoutingConstructor | RoutableComponentRoutingConstructor[]): void;

  [Symbol.iterator](): Iterator<RoutableComponentRoute>;

  /**
   * イベントを定義する
   * @example
   * router.event('shell', 'clicked', 'ShellController', 'shell_clicked'); // full
   * router.event('shell', 'clicked', 'ShellController'); // event = action
   * router.controller('ShellController', function(router) {
   *   router.event('shell', 'clicked'); // controllerは前提があるので省く
   * });
   * router.from('shell', function(router) {
   *   router.controller('ShellController', function(router) {
   *     router.event('clicked'); // from, controllerは前提があるので省く
   *   });
   * });
   */
  event(event: string, action?: string): void;
  event(event: string, controller: string, action?: string): void;
  event(from: string, event: string, action?: string): void;
  event(from: string, event: string, controller: string, action?: string): void;

  /**
   * from, controllerを前提としてイベントを定義する
   * @param event イベント
   * @param [action] アクション
   */
  eventOnFromController(event: string, action?: string): void;

  /**
   * fromを前提としてイベントを定義する
   * @param event イベント
   * @param controller コントローラ
   * @param action アクション
   */
  eventOnFrom(event: string, controller: string, action?: string): void;

  /**
   * controllerを前提としてイベントを定義する
   * @param from イベント発生源
   * @param event イベント
   * @param action アクション
   */
  eventOnController(from: string, event: string, action?: string): void;

  /**
   * 前提なしとしてイベントを定義する
   * @param from イベント発生源
   * @param event イベント
   * @param controller コントローラ
   * @param action アクション
   */
  eventOnNone(from: string, event: string, controller: string, action?: string): void;

  /**
   * イベント発生源を前提とする
   * @param from イベント発生源プロパティ名
   * @param block 前提としたイベント発生源におけるルート定義を行う関数
   */
  from(from: string, block: (routes: RoutableComponentRoutes) => void): void;

  /**
   * コントローラーを前提とする
   * @param controller コントローラ名
   * @param block 前提としたコントローラにおけるルート定義を行う関数
   */
  controller(controller: string, block: (routes: RoutableComponentRoutes) => void): void;

  /**
   * ルート定義を追加する
   * @param from イベント発生源
   * @param event イベント
   * @param controller コントローラ
   * @param action アクション
   */
  addRoute(from: string, event: string, controller:string, action: string): void;

  /**
   * ルーティングの状態を返す
   */
  toString(): string;
}

/**
 * ルート
 */
export class RoutableComponentRoute {
  /**
   * コンストラクタ
   * @param from イベント発生源
   * @param event イベント
   * @param controller コントローラ
   * @param action アクション
   */
  constructor(from: string, event: string, controller:string, action: string);

  /**
   * イベント発生源
   */
  readonly from: string;
  /**
   * イベント
   */
  readonly event: string;
  /**
   * コントローラ
   */
  readonly controller: string;
  /**
   * アクション
   */
  readonly action: string;

  /**
   * ルーティングの状態を返す
   */
  toString(): string;
}
