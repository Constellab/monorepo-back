import {Type} from '@angular/core';
import {Observable} from 'rxjs';
import {Transform} from 'class-transformer';
import {flLazyPropertyTransformToClass} from '@monorepo/front-core-lib';
import {LabUnconvertedEntity} from '../model/global/lab-entity.entity';

/**
 * Annotation to create a FlLazyProperty from a sub object of type {@link LabUnconvertedEntity}
 * @param serviceType class of the service to retrieve the entity
 * @param getObs method with service and id to retrieve the entity
 * @constructor
 */
export function FlLazyPropertyLabTransform<SERVICE, ENTITY>(serviceType: Type<any>,
                                                            getObs?: (service: SERVICE, id: string)
                                                              => Observable<ENTITY>): PropertyDecorator {
  // create date from string
  const transformToClass = Transform(
    (object: LabUnconvertedEntity) => {
      return flLazyPropertyTransformToClass(object.uri, serviceType, getObs);
    },
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToClass(target, key);
  };
}
