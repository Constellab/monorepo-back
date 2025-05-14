import { ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BlReflectorHelper } from '@monorepo/back-core-lib';
import { CnHierarchyObjectTokenGuard } from './cn-hierarchy-object-token-guard.service';

const cnHierarchyObjectTokenMetadata = 'hierarchyObjectToken';

/**
 * @CnHierarchyObjectTokenDecorator decorator for method or class to make a route authenticated with
 * folder access token/
 *
 * The {@link CnLabAuthGuard} check this decorator
 */
export function CnHierarchyObjectTokenDecorator(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    // set the labAuth metadata
    SetMetadata(cnHierarchyObjectTokenMetadata, true)(target, property, descriptor);
    // activate the CnLabAuthGuard
    UseGuards(CnHierarchyObjectTokenGuard)(target, property, descriptor);
  };
}

/**
 * return true if the method or class is decorated with @CnHierarchyObjectTokenTokenGuard
 */
export function cnIsDecoratedWithHierarchyObjectTokenAuth(
  reflector: Reflector,
  context: ExecutionContext
): boolean {
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, cnHierarchyObjectTokenMetadata);
}
