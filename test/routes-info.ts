/// <reference types="mocha" />
import {EventEmitter} from "events";
import {
  EventController,
  EventRoutes,
  EventRouteSetter,
  EventRoutingDefiner,
  LazyEventRouter,
} from "../lib/lazy-event-router";

import * as assert from "power-assert";

class From1 extends EventEmitter {
  constructor() { super(); }
  on(event: "event1", listener: (arg1: string, arg2: number) => void): this;
  on(event: "event2", listener: () => void): this;
  on(event: string, listener: (...args: any[]) => any) {
    return super.on(event, listener);
  }

  emit(event: "event1", arg1: string, arg2: number): boolean;
  emit(event: "event2"): boolean;
  emit(event: string, ...args: any[]) {
    return super.emit(event, ...args);
  }
}

class From2 extends EventEmitter {
  constructor() { super(); }
  on(event: "event3", listener: (arg: boolean) => void): this;
  on(event: "event4", listener: (arg: string) => void): this;
  on(event: string, listener: (...args: any[]) => any) {
    return super.on(event, listener);
  }

  emit(event: "event3", arg: boolean): boolean;
  emit(event: "event4", arg: string): boolean;
  emit(event: string, ...args: any[]) {
    return super.emit(event, ...args);
  }
}

class Controller1 implements EventController {
  action1(arg1: string, arg2: number) {
    return `${arg1} ${arg2}`;
  }

  action2() {
    return true;
  }

  action3(arg: boolean) {
    return arg;
  }
}

class Controller2 implements EventController {
  action4(arg: string) {
    return arg;
  }
}

function myRoutingWithFrom(r: EventRouteSetter) {
  r.from(From1, (r2) => {
    r2.controller(Controller1, (from, controller) => {
      from.on("event1", controller.action1);
      from.on("event2", controller.action2);
    });
  });
  r.from(From2, (r2) => {
    r2.controller(Controller1, (from, controller) => {
      from.on("event3", controller.action3);
    });
  });
  r.from(From2, (r2) => {
    r2.controller(Controller2, (from, controller) => {
      from.on("event4", controller.action4);
    });
  });
}

function myRoutingWithController(r: EventRouteSetter) {
  r.controller(Controller1, (r2) => {
    r2.from(From1, (from, controller) => {
      from.on("event1", controller.action1);
      from.on("event2", controller.action2);
    });
    r2.from(From2, (from, controller) => {
      from.on("event3", controller.action3);
    });
  });
  r.controller(Controller2, (r2) => {
    r2.from(From2, (from, controller) => {
      from.on("event4", controller.action4);
    });
  });
}

function myRoutingWithFromAndController(r: EventRouteSetter) {
  r.fromAndController(From1, Controller1, (from, controller) => {
    from.on("event1", controller.action1);
    from.on("event2", controller.action2);
  });
  r.fromAndController(From2, Controller1, (from, controller) => {
    from.on("event3", controller.action3);
  });
  r.fromAndController(From2, Controller2, (from, controller) => {
    from.on("event4", controller.action4);
  });
}

const from1Routes = new RegExp([
  "From1.event1 => Controller1#(?:bound )?action1",
  "From1.event2 => Controller1#(?:bound )?action2",
].map((line) => `${line}\n`).join(""));
const from2Routes = new RegExp([
  "From2.event3 => Controller1#(?:bound )?action3",
  "From2.event4 => Controller2#(?:bound )?action4",
].map((line) => `${line}\n`).join(""));
const allRoutes = new RegExp([
  "From1.event1 => Controller1#(?:bound )?action1",
  "From1.event2 => Controller1#(?:bound )?action2",
  "From2.event3 => Controller1#(?:bound )?action3",
  "From2.event4 => Controller2#(?:bound )?action4",
].map((line) => `${line}\n`).join(""));

if (From1.name) { // IE not supports Function#name
  describe("LazyEventRouter", () => {
    const subject = (components: EventEmitter[], routing: EventRoutingDefiner | EventRoutingDefiner[]) =>
      new LazyEventRouter(components, new EventRoutes(routing));
    describe("#toString", () => {
      context("by froms", () => {
        it("surely registered", () => {
          assert(from1Routes.test(subject([new From1()], myRoutingWithFromAndController).toString()));
          assert(from2Routes.test(subject([new From2()], myRoutingWithFromAndController).toString()));
          assert(allRoutes.test(subject([new From1(), new From2()], myRoutingWithFromAndController).toString()));
        });
      });
      context("from()", () => {
        it("surely registered", () => {
          assert(allRoutes.test(subject([new From1(), new From2()], myRoutingWithFrom).toString()));
        });
      });
      context("controller()", () => {
        it("surely registered", () => {
          assert(allRoutes.test(subject([new From1(), new From2()], myRoutingWithController).toString()));
        });
      });
      context("fromAndController()", () => {
        it("surely registered", () => {
          assert(allRoutes.test(subject([new From1(), new From2()], myRoutingWithFromAndController).toString()));
        });
      });
    });
  });

  describe("EventRoutes", () => {
    describe("#constructor", () => {
      context("default constructor", () => {
        it("is surely initialized", () => {
          assert(new EventRoutes() instanceof EventRoutes);
        });
      });
      context("single routing classes", () => {
        it("surely initialized", () => {
          assert(new EventRoutes(myRoutingWithFrom) instanceof EventRoutes);
        });
      });
      context("multiple routing classes", () => {
        it("surely initialized", () => {
          assert(new EventRoutes([myRoutingWithFrom, myRoutingWithController]) instanceof EventRoutes);
        });
      });
    });

    describe("#includeRoute", () => {
      const subject = (components: EventEmitter[], routing: EventRoutingDefiner | EventRoutingDefiner[]) =>
        new LazyEventRouter(components, new EventRoutes().includeRoute(routing));
      context("single routing classes", () => {
        it("surely included", () => {
          assert(allRoutes.test(subject([new From1(), new From2()], myRoutingWithFromAndController).toString()));
        });
      });
      context("multiple routing classes", () => {
        it ("surely included", () => {
          assert(allRoutes.test(subject([new From1(), new From2()], [myRoutingWithFromAndController]).toString()));
        });
      });
    });
  });
}
