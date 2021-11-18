import {FlLazyPropertyTransform} from '@monorepo/front-core-lib';
import {BioxResourceService} from '../entity-service/biox-resource.service';

/**
 * Annotation to create a FlLazyProperty from a sub object of type
 * @param serviceType class of the service to retrieve the entity
 * @param getObs method with service and id to retrieve the entity
 * @constructor
 */
// export function FlLazyPropertyLabTransform<SERVICE, ENTITY>(serviceType: Type<any>,
//                                                             getObs?: (service: SERVICE, id: string)
//                                                               => Observable<ENTITY>): PropertyDecorator {
//   // create date from string
//   const transformToClass = Transform(
//     (params: ClTransformFnParams<LabUnconvertedEntity>) => {
//       return flLazyPropertyTransformToClass(params.value.uri, serviceType, getObs);
//     },
//     {toClassOnly: true});
//
//   return (target: any, key: string): void => {
//     transformToClass(target, key);
//   };
// }

/**
 * Annotation to create a FlLazyProperty of a {@link BioxResource} from a resourceId
 */
export function ResourceLazyProperty(): PropertyDecorator {

  const property: PropertyDecorator = FlLazyPropertyTransform(BioxResourceService,
    (service, resourceId: string) => {

      return service.getById(resourceId);
    }
  );


  return (target: any, key: string): void => {
    property(target, key);
  };
}
