import { BlReflectorHelper } from '@monorepo/back-core-lib';
import { ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { HnLabAuthGuard } from '../guards/hn-lab-auth.guard';

const hnLabAuthMetadata = 'labAuth';
const hnLabAllowWithoutUserAuthMetadata = 'labAllowWithoutUserAuth';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function HnLabGuard(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    if (property !== undefined && descriptor !== undefined) {
      // set the public metadata
      SetMetadata('isPublic', true)(target, property, descriptor);
      // set the labAuth metadata
      SetMetadata(hnLabAuthMetadata, true)(target, property, descriptor);
      // activate the CnLabAuthGuard
      UseGuards(HnLabAuthGuard)(target, property, descriptor);
    } else {
      // set the public metadata
      SetMetadata('isPublic', true)(target);
      // set the labAuth metadata
      SetMetadata(hnLabAuthMetadata, true)(target);
      // activate the CnLabAuthGuard
      UseGuards(HnLabAuthGuard)(target);
    }
  };
}

/**
 * Marks a route as requiring only lab-level authentication (API key),
 * without requiring a specific user.
 * Sets `isPublic` to bypass JWT auth and `labAllowWithoutUserAuth`
 * so the guard calls `verify-without-user-rights` instead of
 * `verify-rights`, resulting in a `labNoUser` auth context.
 * Note: unlike HnLabGuard, this does not attach HnLabAuthGuard —
 * the guard must already be applied (e.g., at controller level).
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function HnLabAllowWithoutUserAuthentication(): MethodDecorator & ClassDecorator {
  // combine 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    if (property !== undefined && descriptor !== undefined) {
      // set the public metadata
      SetMetadata('isPublic', true)(target, property, descriptor);
      // set the labAuth metadata
      SetMetadata(hnLabAllowWithoutUserAuthMetadata, true)(target, property, descriptor);
    } else {
      // set the public metadata
      SetMetadata('isPublic', true)(target);
      // set the labAuth metadata
      SetMetadata(hnLabAllowWithoutUserAuthMetadata, true)(target);
    }
  };
}

export function hnIsLabAllowWithoutUserAuth(reflector: Reflector, context: ExecutionContext): boolean {
  // Check if the route is annotated with @Public
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, hnLabAllowWithoutUserAuthMetadata);
}
