import { BlForbiddenException, BlReflectorHelper } from '@monorepo/back-core-lib';
import { applyDecorators, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CnEnterpriseLicenseGuard } from '../guards/cn-enterprise-license.guard';

export const CN_ENTERPRISE_ONLY_METADATA = 'enterpriseOnly';
export const CN_ENTERPRISE_ONLY_ACTION_METADATA = 'enterpriseOnlyAction';

/**
 * Options for the CnEnterpriseOnly decorator
 */
export interface CnEnterpriseOnlyOptions {
  /**
   * The action name to display in the error message.
   * Example: 'sending mail' will result in "The action 'sending mail' is allowed only for enterprise users"
   */
  action: string;
}

/**
 * @CnEnterpriseOnly decorator for method or class to make a route
 * accessible only for users with enterprise license.
 *
 * @example
 * // On a method
 * @CnEnterpriseOnly({ action: 'sending mail' })
 * @Post('send-mail')
 * sendMail() { ... }
 *
 * // On a class
 * @CnEnterpriseOnly({ action: 'accessing premium features' })
 * @Controller('premium')
 * export class PremiumController { ... }
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function CnEnterpriseOnly(options: CnEnterpriseOnlyOptions): MethodDecorator & ClassDecorator {
  return applyDecorators(
    SetMetadata(CN_ENTERPRISE_ONLY_METADATA, true),
    SetMetadata(CN_ENTERPRISE_ONLY_ACTION_METADATA, options.action),
    UseGuards(CnEnterpriseLicenseGuard)
  );
}

/**
 * Returns true if the method or class is decorated with @CnEnterpriseOnly
 */
export function cnIsDecoratedWithEnterpriseOnly(reflector: Reflector, context: ExecutionContext): boolean {
  return BlReflectorHelper.getClassOrMethodMetadata(reflector, context, CN_ENTERPRISE_ONLY_METADATA) === true;
}

/**
 * Returns the action name from the @CnEnterpriseOnly decorator
 */
export function cnGetEnterpriseOnlyAction(reflector: Reflector, context: ExecutionContext): string | null {
  return (
    BlReflectorHelper.getClassOrMethodMetadata(reflector, context, CN_ENTERPRISE_ONLY_ACTION_METADATA) ?? null
  );
}

/**
 * Throws a ForbiddenException with a pretty error message for enterprise-only features
 */
export function cnThrowEnterpriseOnlyError(action: string): never {
  throw new BlForbiddenException(`The action '${action}' is allowed only for enterprise users`);
}
