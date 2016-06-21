import {RoutableComponent} from '../src/lib/routable-component';

import assert from 'power-assert';

/** @test {RoutableComponent} */
describe('RoutableComponent', function() {
  /** @test {RoutableComponent#constructor} */
  context('default constructor', function() {
    subject(function() { return new RoutableComponent() });
    it('surely initialized', function() { assert(this.subject instanceof RoutableComponent) });
  });
  /** @test {RoutableComponent#constructor} */
  context('constructed with components', function() {
    lazy('components', function() { return {a: 1, b: 2} });
    subject(function() { return new RoutableComponent(this.components) });
    it('surely initialized', function() { assert(this.subject instanceof RoutableComponent) });
    it('has child components', function() { assert(this.subject.components.a === 1) });
  });
});
