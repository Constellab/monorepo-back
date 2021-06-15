import {Transform} from 'class-transformer';
import {ClCachedObservable, ClHelpService} from '@monorepo/core-lib';
import {Type} from '@angular/core';
import {Observable, of} from 'rxjs';
import {FlGetById} from '../module/fl-api/model/fl-service.class';
import {flRootInjector} from './fl-root-injector';

/**
 * Decorator to create an {@link FlLazyProperty}
 * @param serviceType class of the service to retrieve the entity
 * @param getObs method with service and unconverted object to retrieve the entity
 */
export function FlLazyPropertyTransform<SERVICE, ENTITY>(serviceType: Type<SERVICE>,
                                                         getObs: (service: SERVICE, unconvertedObject: any) => Observable<ENTITY>
): PropertyDecorator;
/**
 * Decorator to create an {@link FlLazyPropertyId}
 * @param serviceType class of a FlGetById service
 * @constructor
 */
export function FlLazyPropertyTransform<SERVICE extends FlGetById<ENTITY>, ENTITY>(serviceType: Type<SERVICE>): PropertyDecorator;
export function FlLazyPropertyTransform<SERVICE, ENTITY>(serviceType: Type<any>,
                                                         getObs?: (service: SERVICE, unconvertedObject: any) => Observable<ENTITY>
): PropertyDecorator {

  let transformToClass: (target: any, key: string) => void;
  if (typeof (serviceType as any).getById === 'function') {
    // create a lazy property from an id
    transformToClass = Transform(
      (id: string) => {
        return flLazyPropertyTransformIdToClass(id, serviceType);
      },
      {toClassOnly: true});
  } else if (typeof getObs === 'function') {
    // create a lazy property from an object
    transformToClass = Transform(
      (unconvertedObject: string) => {
        return flLazyPropertyTransformToClass(unconvertedObject, serviceType, getObs);
      },
      {toClassOnly: true});
  } else {
    throw new Error('[FlLazyPropertyTransform] Wrong inputs');
  }

  // convert the lazy property back to object on serialization
  const transformToPlain = Transform(
    (lazyProperty: FlLazyProperty<any>) => lazyProperty.object,
    {toPlainOnly: true}
  );


  return (target: any, key: string): void => {
    transformToClass(target, key);
    transformToPlain(target, key);
  };
}

/**
 * Transform function to create a FlLazyProperty from an id and a service
 * @param id id of the entity
 * @param serviceType
 */
export function flLazyPropertyTransformIdToClass<ENTITY>(id: string, serviceType: Type<FlGetById<ENTITY>>): FlLazyPropertyId<ENTITY> {
  if (flRootInjector == null) {
    throw new Error('[FlLazyPropertyTransform] The flRootInjector was not initiated, please call setFlRootInjector in AppModule');
  }
  if (ClHelpService.isNullOrEmpty(id)) {
    return new FlLazyPropertyId<ENTITY>(id, of(null));
  }

  // get the service instance
  const service: FlGetById<ENTITY> = flRootInjector.get(serviceType);

  return new FlLazyPropertyId<ENTITY>(id, service.getById(id));
}

/**
 * Transform function to create a FlLazyProperty from an id and a service
 * @param unconvertedObject object of the property before the conversion
 * @param serviceType
 * @param getObs
 */
export function flLazyPropertyTransformToClass<SERVICE, ENTITY>(unconvertedObject: any, serviceType: Type<SERVICE>,
                                                                getObs?: (service: SERVICE, unconvertedObject: any)
                                                                  => Observable<ENTITY>): FlLazyProperty<ENTITY> {
  if (flRootInjector == null) {
    throw new Error('[FlLazyPropertyTransform] The flRootInjector was not initiated, please call setFlRootInjector in AppModule');
  }

  // get the service instance
  const service: SERVICE = flRootInjector.get(serviceType);

  return new FlLazyProperty<ENTITY>(unconvertedObject, getObs(service, unconvertedObject));
}


/**
 * Class used to lazy load entity from id, initiated with {@link FlLazyPropertyTransform} decorator
 */
export class FlLazyPropertyId<T> extends ClCachedObservable<T> {
  constructor(public id: string,
              obs: Observable<T>) {
    super(obs);
  }
}

/**
 * Class used to lazy load entity from object, initiated with {@link FlLazyPropertyTransform} decorator
 */
export class FlLazyProperty<T, OBJECT = any> extends ClCachedObservable<T> {
  constructor(public object: OBJECT,
              obs: Observable<T>) {
    super(obs);
  }
}
