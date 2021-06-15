import {Type} from '@angular/core';
import {Observable} from 'rxjs';
import {Transform} from 'class-transformer';
import {FlLazyPropertyTransform, flLazyPropertyTransformToClass} from '@monorepo/front-core-lib';
import {LabUnconvertedEntity} from '../model/global/lab-entity.entity';
import {BioxResourceService} from '../entity-service/biox-resource.service';
import {UnconvertedResource} from '../model/entities/biox-resource.entity';

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

/**
 * Annotation to create a FlLazyProperty of a {@link BioxResource} from a {@link UnconvertedResource}
 */
export function ResourceLazyProperty(): PropertyDecorator {

  const property: PropertyDecorator = FlLazyPropertyTransform(BioxResourceService,
    (service, resource: UnconvertedResource) => service.getByTypeAndId(resource.type, resource.uri));

  return (target: any, key: string): void => {
    property(target, key);
  };
}
