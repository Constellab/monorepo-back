import {SetMetadata} from '@nestjs/common';
import {CustomDecorator} from '@nestjs/common/decorators/core/set-metadata.decorator';
import {CmUserCategory} from '@monorepo/common-model';

export const userCategoriesMetadata = 'userCategories';

/**
 * @UserCategories decorator for method of controllers to allow only user with one of the following
 * category to call the route
 */
export const UserCategories = (...userCategories: CmUserCategory[]): CustomDecorator => SetMetadata(userCategoriesMetadata, userCategories);
