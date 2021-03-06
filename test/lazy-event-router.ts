/// <reference types="mocha" />
import {EventEmitter} from "events";
import {
  EventController,
  EventRoutes,
  EventRouteSetter,
  LazyEventRouter,
} from "../lib/lazy-event-router";

import * as assert from "power-assert";

function myUsefulRouting(r: EventRouteSetter) {
  r.fromAndController(MyEventSourceComponent, MyController, (from, controller) => {
    from.on("myevent", controller.myaction);
    from.on("plus", controller.plus);
  });
}

class MyEventSourceComponent extends EventEmitter {
  on(event: "myevent", listener: (arg1: string, arg2: number) => void): this;
  on(event: "plus", listener: () => void): this;
  on(event: string, listener: (...args: any[]) => any) {
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

  get throw() { // not to exec property when binding all methods
    throw new Error("error");
  }
}

describe("LazyEventRouter", () => {
  const routes = () => new EventRoutes(myUsefulRouting);
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
        const component = _subject.component(MyEventSourceComponent) as MyEventSourceComponent;
        assert(component instanceof MyEventSourceComponent);
        component.emit("myevent", "1", 2);
        const controller = _subject.controller(MyController) as MyController;
        assert(controller instanceof MyController);
        assert(controller.router === _subject);
        assert.deepEqual(controller.myactionArgs, ["1", 2]);
      });
    });
  });

  describe("#registerComponent", () => {
    const subject = () => new LazyEventRouter([], routes());

    it("surely registered", () => {
      const _subject = subject();
      _subject.registerComponent(new MyEventSourceComponent());
      const component = _subject.component(MyEventSourceComponent) as MyEventSourceComponent;
      assert(component instanceof MyEventSourceComponent);
      component.emit("myevent", "1", 2);
      const controller = _subject.controller(MyController) as MyController;
      assert(controller instanceof MyController);
      assert(controller.router === _subject);
      assert.deepEqual(controller.myactionArgs, ["1", 2]);
    });

    it("registers only one component event (same instance)", () => {
      const _subject = subject();
      const component = new MyEventSourceComponent();
      _subject.registerComponent(component);
      _subject.registerComponent(component);
      (_subject.component(MyEventSourceComponent) as MyEventSourceComponent).emit("plus");
      assert((_subject.controller(MyController) as MyController).count === 1);
    });

    it("registers only one component event (different instance)", () => {
      const _subject = subject();
      const component = new MyEventSourceComponent();
      _subject.registerComponent(component);
      const component2 = new MyEventSourceComponent();
      _subject.registerComponent(component2);
      (_subject.component(MyEventSourceComponent) as MyEventSourceComponent).emit("plus");
      assert((_subject.controller(MyController) as MyController).count === 1);
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
      assert((_subject.controller(MyController) as MyController).count === 1);
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
      assert((_subject.controller(MyController) as MyController).count === 1);
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
