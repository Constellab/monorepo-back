import {Transform} from 'class-transformer';
import {ClCachedObservable, ClHelpService} from '@monorepo/core-lib';
import {Type} from '@angular/core';
import {Observable, of} from 'rxjs';
import {FlGetById} from '../module/fl-api/model/fl-service.class';
import {flRootInjector} from './fl-root-injector';

/**
 * Decorator to create an {@link FlLazyProperty}
 * @param serviceType class of the service to retrieve the entity
 * @param getObs method with service and id to retrieve the entity
 */
export function FlLazyPropertyTransform<SERVICE, ENTITY>(serviceType: Type<SERVICE>,
                                                         getObs: (service: SERVICE, id: string) => Observable<ENTITY>): PropertyDecorator;
/**
 * Decorator to create an {@link FlLazyProperty}
 * @param serviceType class of a FlGetById service
 * @constructor
 */
export function FlLazyPropertyTransform<SERVICE extends FlGetById<ENTITY>, ENTITY>(serviceType: Type<SERVICE>): PropertyDecorator;
export function FlLazyPropertyTransform<SERVICE, ENTITY>(serviceType: Type<any>,
                                                         getObs?: (service: SERVICE, id: string) => Observable<ENTITY>): PropertyDecorator {
  // create date from string
  const transformToClass = Transform(
    (id: string) => {
      return flLazyPropertyTransformToClass(id, serviceType, getObs);
    },
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToClass(target, key);
  };
}

/**
 * Transform function to create a FlLazyProperty from an id and a service
 * @param id
 * @param serviceType
 * @param getObs
 */
export function flLazyPropertyTransformToClass<SERVICE, ENTITY>(id: string, serviceType: Type<any>,
                                                                getObs?: (service: SERVICE, id: string)
                                                                  => Observable<ENTITY>): FlLazyProperty<any> {
  if (flRootInjector == null) {
    throw new Error('[FlLazyPropertyTransform] The flRootInjector was not initiated, please call setFlRootInjector in AppModule');
  }
  if (ClHelpService.isNullOrEmpty(id)) {
    return new FlLazyProperty<any>(id, of(null));
  }

  // get the service instance
  const service: SERVICE = flRootInjector.get(serviceType);

  // retrieve the entity observable
  let obs: Observable<ENTITY>;

  if (typeof (service as any).getById === 'function') {
    // get the observable directly from the service
    obs = (service as any).getById(id);
  } else if (getObs != null) {
    // get the observable from the getObs method
    obs = getObs(service, id);
  } else {
    throw new Error('[FlLazyPropertyTransform] Wrong inputs');
  }

  return new FlLazyProperty<ENTITY>(id, obs);
}


/**
 * Class used to lazy load entity, initiated with {@link FlLazyPropertyTransform} decorator
 */
export class FlLazyProperty<T> extends ClCachedObservable<T> {
  constructor(public id: string,
              obs: Observable<T>) {
    super(obs);
  }
}
