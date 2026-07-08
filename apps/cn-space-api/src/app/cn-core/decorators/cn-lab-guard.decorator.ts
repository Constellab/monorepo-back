import { BlReflectorHelper } from '@monorepo/back-core-lib';
import { ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CnLabAuthGuard } from '../guards/cn-lab-auth.guard';

const cnLabAuthMetadata = 'labAuth';
const cnLabAllowDevAuthMetadata = 'labAllowDevAuth';
const cnLabRobotAuthMetadata = 'labRobotAuth';

/**
 * @LabGuard decorator for method or class to make a route authenticated with
 * the lab token. It is used for routes called by the lab servers.
 * By default, routes are ont allowed to be used in the DEV environment (using the dev api key), to allow it
 * use the @LabAllowDev decorator
 *
 * The {@link CnLabAuthGuard} check this decorator
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function CnLabGuard(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    if (property !== undefined && descriptor !== undefined) {
      // set the labAuth metadata
      SetMetadata(cnLabAuthMetadata, true)(target, property, descriptor);
      // activate the CnLabAuthGuard
      UseGuards(CnLabAuthGuard)(target, property, descriptor);
    } else {
      // set the labAuth metadata
      SetMetadata(cnLabAuthMetadata, true)(target);
      // activate the CnLabAuthGuard
      UseGuards(CnLabAuthGuard)(target);
    }
  };
}

/**
 * return true if the method or class is decorated with @LabAuth
 */
export function cnIsDecoratedWithLabAuth(reflector: Reflector, context: ExecutionContext): boolean {
  // Check if the route is annotated with @Public
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, cnLabAuthMetadata);
}

/**
 * To be placed on a method or class of an external lab route to force user authentication with robot
 * Useful for route that are called automatically by the lab
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function CnLabRobotAuthentication(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    // set the labAuth metadata
    if (property !== undefined && descriptor !== undefined) {
      SetMetadata(cnLabRobotAuthMetadata, true)(target, property, descriptor);
    } else {
      SetMetadata(cnLabRobotAuthMetadata, true)(target);
    }
  };
}

/**
 * return true if the method or class is decorated with @LabAuth
 */
export function cnIsLabRobotAuth(reflector: Reflector, context: ExecutionContext): boolean {
  // Check if the route is annotated with @Public
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, cnLabRobotAuthMetadata) === true;
}

/**
 * To be placed on a method or class already decorated with @LabAuth to allow the route to be called
 * from the DEV environment (using the dev api key)
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function CnLabAllowDev(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    // set the labAuth metadata
    if (property !== undefined && descriptor !== undefined) {
      SetMetadata(cnLabAllowDevAuthMetadata, true)(target, property, descriptor);
    } else {
      SetMetadata(cnLabAllowDevAuthMetadata, true)(target);
    }
  };
}

/**
 * return true if the method or class is decorated with @LabAuth
 */
export function cnIsAllowedDev(reflector: Reflector, context: ExecutionContext): boolean {
  // Check if the route is annotated with @Public
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, cnLabAllowDevAuthMetadata) === true;
}
