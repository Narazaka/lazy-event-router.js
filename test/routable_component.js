import {RoutableComponent, RoutableComponentRoutes} from '../src/lib/routable-component';
import {EventEmitter} from 'events';

import assert from 'power-assert';

class MyUsefulRouting {
  setup(routes) {
    routes.event('MyEventSourceComponent', 'myevent', 'MyController', 'myaction');
    routes.event('MyEventSourceComponent', 'noevent', 'MyController', 'noaction');
    routes.event('MyEventSourceComponent', 'plus', 'MyController');
  }
}

class MyEventSourceComponent extends EventEmitter {
  constructor() {
    super();
  }
}

class MyController {
  constructor(component) {
    this.component = component;
    this.count = 0;
  }

  myaction(...args) {
    this.myaction_args = args;
  }

  plus() {
    this.count++;
  }
}

/** @test {RoutableComponent} */
describe('RoutableComponent', function() {
  lazy('routes', function() { return new RoutableComponentRoutes(this.routing_classes) });
  lazy('routing_classes', function() { return MyUsefulRouting });
  lazy('components', function() { return {MyEventSourceComponent: new MyEventSourceComponent()} });
  lazy('controller_classes', function() { return {MyController} });
  lazy('MyEventSourceComponent', function() { return this.subject.components.MyEventSourceComponent });
  /** @test {RoutableComponent#constructor} */
  context('constructed with', function() {
    context('no components', function() {
      subject(function() { return new RoutableComponent(this.routes, this.controller_classes) });
      it('surely initialized', function() {
        assert.doesNotThrow(() => this.subject);
        assert(this.subject instanceof RoutableComponent);
      });
    });
    context('components', function() {
      subject(function() { return new RoutableComponent(this.routes, this.controller_classes, this.components) });
      it('surely initialized', function() {
        assert.doesNotThrow(() => this.subject);
        assert(this.subject instanceof RoutableComponent);
      });

      it('event works', function() {
        assert(this.subject.controllers.MyController === undefined);
        assert.throws(
          () => this.MyEventSourceComponent.emit('noevent', "1", 2),
          /controller \[MyController\] does not have action \[noaction\]/
        );
        this.MyEventSourceComponent.emit('myevent', "1", 2),
        assert(this.subject.controllers.MyController.component === this.subject);
        assert.deepEqual(this.subject.controllers.MyController.myaction_args, ["1", 2]);
      });
    });
  });

  /** @test {RoutableComponent#register_component} */
  context('register_component', function() {
    subject(function() { return new RoutableComponent(this.routes, this.controller_classes) });

    it('surely registered', function() {
      this.subject.register_component('MyEventSourceComponent', new MyEventSourceComponent());
      assert(this.MyEventSourceComponent instanceof MyEventSourceComponent);
      this.MyEventSourceComponent.emit('myevent', "1", 2),
      assert(this.subject.controllers.MyController.component === this.subject);
      assert.deepEqual(this.subject.controllers.MyController.myaction_args, ["1", 2]);
    });

    it('surely registered with another name', function() {
      this.subject.register_component('AnotherNameComponent', new MyEventSourceComponent());
      assert(this.subject.components.AnotherNameComponent instanceof MyEventSourceComponent);
      this.subject.components.AnotherNameComponent.emit('myevent', "1", 2),
      assert(this.subject.controllers.MyController === undefined);
    });

    it('registers only one component event', function() {
      const component = new MyEventSourceComponent();
      this.subject.register_component('MyEventSourceComponent', component);
      this.subject.register_component('MyEventSourceComponent', component);
      this.MyEventSourceComponent.emit('plus');
      assert(this.subject.controllers.MyController.count === 1);
    });
  });

  /** @test {RoutableComponent#unregister_component} */
  context('unregister_component', function() {
    subject(function() { return new RoutableComponent(this.routes, this.controller_classes) });

    it('surely unregistered', function() {
      const component = new MyEventSourceComponent();
      this.subject.register_component('MyEventSourceComponent', component);
      this.MyEventSourceComponent.emit('plus');
      this.subject.unregister_component('MyEventSourceComponent');
      this.MyEventSourceComponent.emit('plus');
      assert(this.subject.components.MyEventSourceComponent === undefined);
      assert(this.subject.controllers.MyController.count === 1);
    });
  });

  /** @test {RoutableComponent#register_components} */
  context('register_components', function() {
    subject(function() { return new RoutableComponent(this.routes, this.controller_classes) });

    it('surely registered', function() {
      this.subject.register_components(this.components);
      assert(this.MyEventSourceComponent instanceof MyEventSourceComponent);
    });
  });

  /** @test {RoutableComponent#register_component} */
  context('register_component events', function() {

    context('controller exists', function() {
      subject(function() { return new RoutableComponent(this.routes, this.controller_classes, this.components) });

      it('event works', function() {
        assert(this.subject.controllers.MyController === undefined);
        this.MyEventSourceComponent.emit('myevent', "1", 2),
        assert(this.subject.controllers.MyController.component === this.subject);
        assert.deepEqual(this.subject.controllers.MyController.myaction_args, ["1", 2]);
      });

      it('no action error works', function() {
        assert.throws(
          () => this.MyEventSourceComponent.emit('noevent', "1", 2),
          /controller \[MyController\] does not have action \[noaction\]/
        );
      });
    });

    context('controller not exists', function() {
      subject(function() { return new RoutableComponent(this.routes, {}, this.components) });
      it('no controller error works', function() {
        assert.throws(
          () => this.MyEventSourceComponent.emit('noevent', "1", 2),
          /controller \[MyController\] not found/
        );
      });
    });
  });
});
