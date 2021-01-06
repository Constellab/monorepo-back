// metadata key
const notUpdatableMetadata = 'NotUpdatable';

/**
 * Property decorator to prevent update of property (useful for oneToMany property)
 * when using the {@link AbstractService}
 */
export function NotUpdatable(): PropertyDecorator {
  return (target: any, key: string): void => {
    Reflect.defineMetadata(notUpdatableMetadata, true, target.constructor, key);
  };
}

/**
 * return true if the property of the target is annotated with NotUpdatable decorator
 * @param target object class
 * @param key property name to check if annotated
 */
export function propertyIsNotUpdatable(target: object, key: string): boolean {
  return Reflect.getMetadata(notUpdatableMetadata, target.constructor, key) === true;
}
