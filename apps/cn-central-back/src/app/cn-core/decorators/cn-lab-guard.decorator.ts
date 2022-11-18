import {ExecutionContext, SetMetadata, UseGuards} from '@nestjs/common';
import {CnLabAuthGuard} from '../guards/cn-lab-auth.guard';
import {Reflector} from '@nestjs/core';
import {BlReflectorHelper} from '@monorepo/back-core-lib';

export const cnLabAuthMetadata = 'labAuth';
export const cnLabRobotAuthMetadata = 'labRobotAuth';

/**
 * @LabGuard decorator for method or class to make a route authenticated with
 * the lab token. It is used for routes called by the lab servers.
 *
 * The {@link CnLabAuthGuard} check this decorator
 */
export function ClLabGuard(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    // set the labAuth metadata
    SetMetadata(cnLabAuthMetadata, true)(target, property, descriptor);
    // activate the CnLabAuthGuard
    UseGuards(CnLabAuthGuard)(target, property, descriptor);
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
 * To be placed on a method or class of a external lab route to force user authentication with robot
 * Useful for route that are called automatically by the lab
 * @constructor
 */
export function ClLabRobotAuthentication(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    // set the labAuth metadata
    SetMetadata(cnLabRobotAuthMetadata, true)(target, property, descriptor);
  };
}

/**
 * return true if the method or class is decorated with @LabAuth
 */
export function cnIsLabRobotAuth(reflector: Reflector, context: ExecutionContext): boolean {
  // Check if the route is annotated with @Public
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, cnLabRobotAuthMetadata) === true;
}
