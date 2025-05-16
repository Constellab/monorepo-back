import { BlReflectorHelper } from '@monorepo/back-core-lib';
import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const cnHierarchyObjectTokenMetadata = 'hierarchyObjectToken';

/**
 * @CnHierarchyObjectTokenDecorator decorator for method or class to make a route authenticated with
 * folder access token.
 * when used the token authentication is priorized over the user authentication
 * If there is not token, the user authentication is used
 *
 * The {@link CnLabAuthGuard} check this decorator
 */
export function CnHierarchyObjectTokenDecorator(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    // set the labAuth metadata
    SetMetadata(cnHierarchyObjectTokenMetadata, true)(target, property, descriptor);
    // activate the CnLabAuthGuard
    // UseGuards(CnHierarchyObjectTokenGuard)(target, property, descriptor);
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
