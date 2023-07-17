import {SetMetadata} from '@nestjs/common';
import {CustomDecorator} from '@nestjs/common/decorators/core/set-metadata.decorator';
import {BlUserCategory} from '@monorepo/back-core-lib';

export const cnUserCategoriesMetadata = 'userCategories';

/**
 * @UserCategories decorator for method of controllers to allow only user with one of the following
 * category to call the route
 */
export const CnUserCategories = (...userCategories: BlUserCategory[]): CustomDecorator =>
  SetMetadata(cnUserCategoriesMetadata, userCategories);
