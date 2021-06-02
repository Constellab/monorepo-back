import {ClHelpService} from '../utils/cl-help.service';

/**
 * Decorator to place on class property, it will coerce the value set into a boolean
 * @constructor
 */
export function ClCoerceBooleanDecorator<T>(): PropertyDecorator {

  // use to store the private value called by getter and setter
  const cachedValueKey = Symbol();

  return (target: any, key: string): void => {
    Object.defineProperty(target, key, {
      set: function (value: T): void {
        // update private value
        this[cachedValueKey] = ClHelpService.coerceBooleanOrEmptyProperty(value);
      },
      // getter to access private value
      get: function (): T {
        return this[cachedValueKey];
      }
    });
  };
}
