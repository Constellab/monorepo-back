import {ExecutionContext, SetMetadata, UseGuards} from '@nestjs/common';
import {LabAuthGuard} from '../guards/lab-auth.gaurd';
import {Reflector} from '@nestjs/core';
import {BlReflectorHelper} from '@monorepo/back-core-lib';

export const labAuthMetadata = 'labAuth';

/**
 * @LabGuard decorator for method or class to make a route authenticated with
 * the lab token. It is used for routes called by the lab servers.
 *
 * The {@link LabAuthGuard} check this decorator
 */
export function LabGuard(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    // set the labAuth metadata
    SetMetadata(labAuthMetadata, true)(target, property, descriptor);
    // activate the LabAuthGuard
    UseGuards(LabAuthGuard)(target, property, descriptor);
  };
}

/**
 * return true if the method or class is decorated with @LabAuth
 */
export function isDecoratedWithLabAuth(reflector: Reflector, context: ExecutionContext): boolean{
  // Check if the route is annotated with @Public
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, labAuthMetadata);
}
