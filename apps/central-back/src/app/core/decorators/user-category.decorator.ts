import {SetMetadata} from '@nestjs/common';
import {UserCategory} from '../../users/user-category.enum';
import {CustomDecorator} from '@nestjs/common/decorators/core/set-metadata.decorator';

export const userCategoriesMetadata = 'userCategories';

export const UserCategories = (...userCategories: UserCategory[]): CustomDecorator => SetMetadata(userCategoriesMetadata, userCategories);
