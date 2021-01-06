import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {UserCategory} from '../../users/user-category.enum';
import {User} from '../../users/user.entity';
import {userCategoriesMetadata} from '../decorators/user-category.decorator';
import {ReflectorHelper} from '../utils/reflector.helper';

/**
 * Guard that work with the decorator @UserCategories to guard route based
 * on user Category
 */
@Injectable()
export class UserCategoryGuard implements CanActivate {
  constructor(private reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean {
    // verify that the route is annotated with @UserCategory
    const userCategories: UserCategory[] = ReflectorHelper.getClassOrMethodMetadata(this.reflector, context, userCategoriesMetadata);
    // if not annotated, grant access
    if (!userCategories || userCategories.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // grant all access to admin
    if (user.category === UserCategory.ADMIN) {
      return true;
    }

    return userCategories.includes(user.category);
  }
}
