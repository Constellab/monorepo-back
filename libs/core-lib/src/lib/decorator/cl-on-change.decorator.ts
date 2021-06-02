/**
 * Object provided in {@link ClOnChange} callback to compare change
 */
export interface ClSimpleChange<T> {
  previousValue: T;
  currentValue: T;
  firstChange: boolean;
}

/**
 * Decorator to place on class property to trigger code when instance of value changed
 *
 * It create getter and setter and a private property to handle change
 *
 * Code form : https://www.npmjs.com/package/property-watch-decorator
 * @param callback method called when instance changed
 * @constructor
 * @example :
 * @ClOnChange(function (this: ExampleComponent, value: any) {
 *    this.callChange(value);
 *  })
 */
export function ClOnChange<T>(callback: (value: T, simpleChange: ClSimpleChange<T>) => void): PropertyDecorator {

  // use to store the private value called by getter and setter
  const cachedValueKey = Symbol();
  // key to store if it's the first change
  const isFirstChangeKey = Symbol();

  return (target: any, key: string): void => {
    Object.defineProperty(target, key, {
      set: function (value: T): void {
        // check if the value as changed
        if (this[cachedValueKey] === value) {
          return;
        }

        // if this is the first time, set isFirstChange to true
        this[isFirstChangeKey] = this[isFirstChangeKey] === undefined;

        // build simple change object
        const simpleChange: ClSimpleChange<T> = {
          previousValue: this[cachedValueKey],
          currentValue: value,
          firstChange: this[isFirstChangeKey]
        };

        // update private value
        this[cachedValueKey] = value;
        // call callback
        callback.call(this, value, simpleChange);
      },
      // getter to access private value
      get: function (): T {
        return this[cachedValueKey];
      }
    });
  };
}
