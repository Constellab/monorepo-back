import {Controller, Get} from '@nestjs/common';
import {UsersService} from './users.service';
import {User} from './user.entity';
import {UserCategories} from '../core/decorators/user-category.decorator';
import {UserCategory} from './user-category.enum';

@Controller('users')
export class UsersController {

  constructor(private usersService: UsersService) {
  }

  @Get('/current')
  async current(): Promise<User> {
    return this.usersService.getCurrent();
  }

  @UserCategories(UserCategory.ADMIN)
  @Get('')
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

}
