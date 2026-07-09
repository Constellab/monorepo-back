import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { HnCurrentUserHelper } from '../utils/hn-current-user.helper';

@Injectable()
export class HnIsAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdmin = this.reflector.get<boolean>('isAdmin', context.getHandler());
    if (!isAdmin) {
      return true;
    }
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    return currentUser != null && currentUser.isAdmin();
  }
}
