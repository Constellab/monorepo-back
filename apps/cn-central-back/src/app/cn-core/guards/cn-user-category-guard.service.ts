import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {CnUser} from '../../cn-users/cn-user.entity';
import {cnUserCategoriesMetadata} from '../decorators/cn-user-category.decorator';
import {BlReflectorHelper, BlUserCategory} from '@monorepo/back-core-lib';

/**
 * Guard that work with the decorator @UserCategories to guard route based
 * on user Category
 */
@Injectable()
export class CnUserCategoryGuard implements CanActivate {
  constructor(private reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean {
    // verify that the route is annotated with @UserCategory
    const userCategories: BlUserCategory[] = BlReflectorHelper.getClassOrMethodMetadata(this.reflector, context, cnUserCategoriesMetadata);
    // if not annotated, grant access
    if (!userCategories || userCategories.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: CnUser = request.user;

    // grant all access to admin
    if (user.category === BlUserCategory.ADMIN) {
      return true;
    }

    return userCategories.includes(user.category);
  }
}
