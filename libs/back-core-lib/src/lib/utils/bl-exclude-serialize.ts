import {ClPage} from '@monorepo/core-lib';
import {BlEntityWithId} from '../models/bl-entity-with-id.entity';

/**
 * Decorator to place on controller method to exclude field during serialization
 * Support entity, array and Page
 * /!\ This decorator MUST be the last decorator in the controller method)
 * @param excludeFields
 * @constructor
 */
export function BlExcludeSerialize(excludeFields: string[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      if (result instanceof ClPage) {
        return excludeFieldsInPage(result, excludeFields);
      } else if (result instanceof Array) {
        return excludeFieldsInArray(result, excludeFields);
      } else if (result instanceof BlEntityWithId) {
        return excludeFieldsInEntity(result, excludeFields);
      }
      return result;
    };

    return descriptor;
  };
}

function excludeFieldsInPage(page: ClPage<BlEntityWithId>, excludeFields: string[]): ClPage<BlEntityWithId> {
  page.objects = excludeFieldsInArray(page.objects, excludeFields);
  return page;
}

function excludeFieldsInArray(entities: BlEntityWithId[], excludeFields: string[]): BlEntityWithId[] {
  for (const entity of entities) {
    excludeFieldsInEntity(entity, excludeFields);
  }
  return entities;
}

function excludeFieldsInEntity(entity: BlEntityWithId, excludeFields: string[]): BlEntityWithId {
  for (const excludeField of excludeFields) {
    delete entity[excludeField];
  }
  return entity;
}
