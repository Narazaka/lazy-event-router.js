/// <reference types="mocha" />
import {EventEmitter} from "events";
import {
  EventController,
  EventRoutes,
  EventRouteSetter,
  EventRouting,
  LazyEventRouter,
} from "../src/lib/lazy-event-router";

import * as assert from "power-assert";

class MyUsefulRouting implements EventRouting {
  setup(r: EventRouteSetter) {
    r.fromAndController(MyEventSourceComponent, MyController, (from, controller) => {
      from.on("myevent", controller.myaction);
      from.on("plus", controller.plus);
    });
  }
}

class MyEventSourceComponent extends EventEmitter {
  on(event: "myevent", listener: (arg1: string, arg2: number) => void): this;
  on(event: "plus", listener: () => void): this;
  on(event: string, listener: Function) {
    return super.on(event, listener);
  }

  emit(event: "myevent", arg1: string, arg2: number): boolean;
  emit(event: "plus"): boolean;
  emit(event: string, ...args: any[]) {
    return super.emit(event, ...args);
  }
}

class MyController implements EventController {
  router: LazyEventRouter;
  count: number = 0;
  myactionArgs: any[];

  constructor(router: LazyEventRouter) {
    this.router = router;
  }

  myaction(...args: any[]) {
    this.myactionArgs = args;
  }

  plus() {
    this.count++;
  }
}

describe("LazyEventRouter", () => {
  const routes = () => new EventRoutes(MyUsefulRouting);
  const components = () => [new MyEventSourceComponent()];

  describe("#constructor", () => {
    context("no components", () => {
      const subject = () => new LazyEventRouter([], routes());
      it("surely initialized", () => {
        assert.doesNotThrow(() => subject());
        assert(subject() instanceof LazyEventRouter);
      });
    });
    context("components", () => {
      const subject = () => new LazyEventRouter(components(), routes());
      it("surely initialized", () => {
        assert.doesNotThrow(() => subject());
        assert(subject() instanceof LazyEventRouter);
      });

      it("event works", () => {
        const _subject = subject();
        _subject.component(MyEventSourceComponent).emit("myevent", "1", 2);
        assert(_subject.controller(MyController).router === _subject);
        assert.deepEqual(_subject.controller(MyController).myactionArgs, ["1", 2]);
      });
    });
  });

  describe("#registerComponent", () => {
    const subject = () => new LazyEventRouter([], routes());

    it("surely registered", () => {
      const _subject = subject();
      _subject.registerComponent(new MyEventSourceComponent());
      assert(_subject.component(MyEventSourceComponent) instanceof MyEventSourceComponent);
      _subject.component(MyEventSourceComponent).emit("myevent", "1", 2);
      assert(_subject.controller(MyController).router === _subject);
      assert.deepEqual(_subject.controller(MyController).myactionArgs, ["1", 2]);
    });

    it("registers only one component event (same instance)", () => {
      const _subject = subject();
      const component = new MyEventSourceComponent();
      _subject.registerComponent(component);
      _subject.registerComponent(component);
      _subject.component(MyEventSourceComponent).emit("plus");
      assert(_subject.controller(MyController).count === 1);
    });

    it("registers only one component event (different instance)", () => {
      const _subject = subject();
      const component = new MyEventSourceComponent();
      _subject.registerComponent(component);
      const component2 = new MyEventSourceComponent();
      _subject.registerComponent(component2);
      _subject.component(MyEventSourceComponent).emit("plus");
      assert(_subject.controller(MyController).count === 1);
    });
  });

  describe("#unregisterComponent", () => {
    const subject = () => new LazyEventRouter([], routes());

    it("surely unregistered", () => {
      const _subject = subject();
      const component = new MyEventSourceComponent();
      _subject.registerComponent(component);
      component.emit("plus");
      _subject.unregisterComponent(MyEventSourceComponent);
      component.emit("plus");
      assert(_subject.component(MyEventSourceComponent) === undefined);
      assert(_subject.controller(MyController).count === 1);
    });

    it("not unregistered other scope events", () => {
      const _subject = subject();
      const component = new MyEventSourceComponent();
      let count = 0;
      component.on("plus", () => count++);
      _subject.registerComponent(component);
      component.emit("plus");
      _subject.unregisterComponent(MyEventSourceComponent);
      component.emit("plus");
      assert(_subject.component(MyEventSourceComponent) === undefined);
      assert(_subject.controller(MyController).count === 1);
      assert(count === 2);
    });
  });

  describe("#registerComponents", () => {
    const subject = () => new LazyEventRouter([], routes());

    it("surely registered", () => {
      const _subject = subject();
      _subject.registerComponents(components());
      assert(_subject.component(MyEventSourceComponent) instanceof MyEventSourceComponent);
    });
  });
});
