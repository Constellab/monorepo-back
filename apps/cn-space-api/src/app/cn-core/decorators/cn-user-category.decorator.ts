import { BlUserCategory } from '@monorepo/back-core-lib';
import { SetMetadata } from '@nestjs/common';
import { CustomDecorator } from '@nestjs/common/decorators/core/set-metadata.decorator';

export const CN_USER_CATEGORIES_METADATA = 'userCategories';

/**
 * @UserCategories decorator for method of controllers to allow only user with one of the following
 * category to call the route
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const CnUserCategories = (...userCategories: BlUserCategory[]): CustomDecorator =>
  SetMetadata(CN_USER_CATEGORIES_METADATA, userCategories);
