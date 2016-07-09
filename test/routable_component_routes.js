import {RoutableComponentRoutes} from '../src/lib/routable-component';
import {EventEmitter} from 'events';

import assert from 'power-assert';

class MyRouting {
  setup(routes) {
    routes.event('from1', 'event1', 'controller1', 'action1');
    routes.event('from2', 'event2', 'controller2', 'action2');
    routes.event('from3', 'event3', 'controller3', 'action3');
  }
}

class MyRoutingWithFrom {
  setup(routes) {
    routes.from('with_from1', (routes) => {
      routes.event('event1', 'controller1', 'action1');
      routes.event('event2', 'controller2', 'action2');
    });
    routes.from('with_from2', (routes) => {
      routes.event('event3', 'controller3', 'action3');
    });
  }
}

class MyRoutingWithController {
  setup(routes) {
    routes.controller('with_controller1', (routes) => {
      routes.event('from1' ,'event1', 'action1');
      routes.event('from2', 'event2', 'action2');
    });
    routes.controller('with_controller2', (routes) => {
      routes.event('from3', 'event3', 'action3');
    });
  }
}

class MyRoutingWithFromController {
  setup(routes) {
    routes.from('with_from10', (routes) => {
      routes.controller('with_controller10', (routes) => {
        routes.event('event1', 'action1');
        routes.event('event2', 'action2');
      });
      routes.controller('with_controller20', (routes) => {
        routes.event('event3', 'action3');
      });
    });
    routes.from('with_from20', (routes) => {
      routes.controller('with_controller30', (routes) => {
        routes.event('event4', 'action4');
      });
    });
  }
}

/** @test {RoutableComponentRoutes} */
describe('RoutableComponentRoutes', function() {
  /** @test {RoutableComponentRoutes#constructor} */
  context('default constructor', function() {
    subject(function() { return new RoutableComponentRoutes() });
    it('is surely initialized', function() { assert(this.subject instanceof RoutableComponentRoutes) });
  });
  /** @test {RoutableComponentRoutes#constructor} */
  context('constructed with', function() {
    subject(function() { return new RoutableComponentRoutes(this.routing_classes) });
    context('single routing classes', function() {
      lazy('routing_classes', function() { return MyRouting });
      it('surely initialized', function() { assert(this.subject instanceof RoutableComponentRoutes) });
    });
    context('multiple routing classes', function() {
      lazy('routing_classes', function() { return [MyRouting, MyRoutingWithFrom] });
      it('surely initialized', function() { assert(this.subject instanceof RoutableComponentRoutes) });
    });
  });
  /** @test {RoutableComponentRoutes#include_route} */
  context('include_route with', function() {
    subject(function() {
      const routes = new RoutableComponentRoutes();
      routes.include_route(this.routing_classes);
      return routes;
    });
    context('single routing classes', function() {
      lazy('routing_classes', function() { return MyRouting });
      it('surely included', function() {
        assert(this.subject.toString().match(/^from1.event1 => controller1#action1/));
      });
    });
    context('multiple routing classes', function() {
      lazy('routing_classes', function() { return [MyRouting, MyRoutingWithFrom] });
      it('surely included', function() {
        assert(this.subject.toString().match(/^from1.event1 => controller1#action1/));
        assert(this.subject.toString().match(/with_from2.event3 => controller3#action3\n$/));
      });
    });
  });
  /** @test {RoutableComponentRoutes#event} */
  context('event register with', function() {
    subject(function() { return new RoutableComponentRoutes(this.routing_classes) });
    context('simple event()', function() {
      lazy('routing_classes', function() { return MyRouting });
      it('surely registered', function() {
        assert(this.subject.toString().match(/^from1.event1 => controller1#action1/));
      });
    });
    context('from()', function() {
      lazy('routing_classes', function() { return MyRoutingWithFrom });
      it('surely registered', function() {
        assert(this.subject.toString().match(/^with_from1.event1 => controller1#action1/));
        assert(this.subject.toString().match(/with_from2.event3 => controller3#action3\n$/));
      });
    });
    context('controller()', function() {
      lazy('routing_classes', function() { return MyRoutingWithController });
      it('surely registered', function() {
        assert(this.subject.toString().match(/^from1.event1 => with_controller1#action1/));
        assert(this.subject.toString().match(/from3.event3 => with_controller2#action3\n$/));
      });
    });
    context('from() and controller()', function() {
      lazy('routing_classes', function() { return MyRoutingWithFromController });
      it('surely registered', function() {
        assert(this.subject.toString().match(/^with_from10.event1 => with_controller10#action1/));
        assert(this.subject.toString().match(/with_from20.event4 => with_controller30#action4\n$/));
      });
    });
  });
});
