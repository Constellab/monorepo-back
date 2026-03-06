import { BlReflectorHelper } from '@monorepo/back-core-lib';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CnUserLicense } from '../../cn-users/cn-user.entity';
import {
  CN_ENTERPRISE_ONLY_ACTION_METADATA,
  CN_ENTERPRISE_ONLY_METADATA,
  cnThrowEnterpriseOnlyError,
} from '../decorators/cn-enterprise-only.decorator';
import { CnCurrentUserHelper } from '../utils/cn-current-user.helper';

/**
 * Guard that works with the decorator @CnEnterpriseOnly to restrict route access
 * to users with an enterprise license.
 *
 * Admin users always have access regardless of their license.
 */
@Injectable()
export class CnEnterpriseLicenseGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route is annotated with @CnEnterpriseOnly
    const isEnterpriseOnly: boolean = BlReflectorHelper.getClassOrMethodMetadata(
      this.reflector,
      context,
      CN_ENTERPRISE_ONLY_METADATA
    );

    // If not annotated, grant access
    if (!isEnterpriseOnly) {
      return true;
    }

    const user = CnCurrentUserHelper.getAndCheckCurrentUser();

    // Admin users always have access
    if (user.isAdmin()) {
      return true;
    }

    // Check if user has enterprise license
    if (user.license === CnUserLicense.ENTERPRISE) {
      return true;
    }

    // Get the action name for the error message
    const action: string =
      BlReflectorHelper.getClassOrMethodMetadata(
        this.reflector,
        context,
        CN_ENTERPRISE_ONLY_ACTION_METADATA
      ) ?? 'this action';

    cnThrowEnterpriseOnlyError(action);
  }
}
