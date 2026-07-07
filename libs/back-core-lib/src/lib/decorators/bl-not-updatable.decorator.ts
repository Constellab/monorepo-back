// metadata key
const blNotUpdatableMetadata = 'NotUpdatable';

/**
 * Property decorator to prevent update of property (useful for oneToMany property)
 * when using the {@link AbstractService}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function BlNotUpdatable(): PropertyDecorator {
  return (target: any, key: string): void => {
    Reflect.defineMetadata(blNotUpdatableMetadata, true, target.constructor, key);
  };
}

/**
 * return true if the property of the target is annotated with NotUpdatable decorator
 * @param target object class
 * @param key property name to check if annotated
 */
export function blPropertyIsNotUpdatable(target: any, key: string): boolean {
  return Reflect.getMetadata(blNotUpdatableMetadata, target.constructor, key) === true;
}
