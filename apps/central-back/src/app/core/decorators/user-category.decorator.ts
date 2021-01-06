import {SetMetadata} from '@nestjs/common';
import {UserCategory} from '../../users/user-category.enum';

export const userCategoriesMetadata = 'userCategories';

export const UserCategories = (...userCategories: UserCategory[]) => SetMetadata(userCategoriesMetadata, userCategories);
