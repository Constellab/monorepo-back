import { BlReflectorHelper } from '@monorepo/back-core-lib';
import { ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CnLabManagerAuthGuard } from '../guards/cn-lab-auth.guard';

const cnLabManagerAuthMetadata = 'labManagerAuth';

/**
 * @LabManagerGuard decorator for method or class to make a route authenticated with
 * Handle by CnLabManagerAuthGuard class
 * the lab manager token. It is used for routes called by the lab manager.
 *
 * The {@link CnLabManagerAuthGuard} check this decorator
 */
export function CnLabManagerGuard(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    // set the labAuth metadata
    SetMetadata(cnLabManagerAuthMetadata, true)(target, property, descriptor);
    // activate the CnLabAuthGuard
    UseGuards(CnLabManagerAuthGuard)(target, property, descriptor);
  };
}

/**
 * return true if the method or class is decorated with @LabManagerAuth
 */
export function cnIsDecoratedWithLabManagerAuth(reflector: Reflector, context: ExecutionContext): boolean {
  // Check if the route is annotated with @Public
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, cnLabManagerAuthMetadata);
}
