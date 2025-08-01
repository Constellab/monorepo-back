import { BlReflectorHelper } from '@monorepo/back-core-lib';
import { ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { HnLabAuthGuard } from '../guards/hn-lab-auth.guard';

const hnLabAuthMetadata = 'labAuth';
const hnLabAllowWithoutUserAuthMetadata = 'labAllowWithoutUserAuth';

export function HnLabGuard(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    // set the public metadata
    SetMetadata('isPublic', true)(target, property, descriptor);
    // set the labAuth metadata
    SetMetadata(hnLabAuthMetadata, true)(target, property, descriptor);
    // activate the CnLabAuthGuard
    UseGuards(HnLabAuthGuard)(target, property, descriptor);
  };
}

export function HnLabAllowWithoutUserAuthentication(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    // set the public metadata
    SetMetadata('isPublic', true)(target, property, descriptor);
    // set the labAuth metadata
    SetMetadata(hnLabAllowWithoutUserAuthMetadata, true)(target, property, descriptor);
  };
}

export function hnIsLabAllowWithoutUserAuth(reflector: Reflector, context: ExecutionContext): boolean {
  // Check if the route is annotated with @Public
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, hnLabAllowWithoutUserAuthMetadata);
}
