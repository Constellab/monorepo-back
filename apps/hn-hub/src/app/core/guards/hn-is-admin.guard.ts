import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {HnCurrentUserHelper} from '../utils/hn-current-user.helper';
import {Reflector} from '@nestjs/core';

@Injectable()
export class HnIsAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean {
    const isAdmin = this.reflector.get<boolean>('isAdmin', context.getHandler());
    if (!isAdmin) {
      return true;
    }
    return HnCurrentUserHelper.getCurrentUser() && HnCurrentUserHelper.getCurrentUser().isAdmin();
  }
}
