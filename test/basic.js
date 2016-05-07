import {RoutableComponent} from '../src/lib/routable-component';

import assert from 'power-assert';

/** @test {RoutableComponent} */
describe('basic', function() {
  lazy('component', function() { return new RoutableComponent() });
  /** @test {RoutableComponent#constructor} */
  context('aaa', function() {
    it('', function() { assert(this.component instanceof RoutableComponent) });
  });
});
