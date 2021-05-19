import {SetMetadata} from '@nestjs/common';
import {CustomDecorator} from '@nestjs/common/decorators/core/set-metadata.decorator';
import {CmUserCategory} from '@monorepo/common-model';

export const userCategoriesMetadata = 'userCategories';

export const UserCategories = (...userCategories: CmUserCategory[]): CustomDecorator => SetMetadata(userCategoriesMetadata, userCategories);
