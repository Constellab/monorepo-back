import {Controller, Get, Param, Put} from '@nestjs/common';
import {UsersService} from './users.service';
import {User} from './user.entity';
import {UserCategories} from '../core/decorators/user-category.decorator';
import {UserCategory} from './user-category.enum';
import {ParseEnumPipe} from '../core/pipes/parse-enum.pipe';
import {ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';

@Controller('users')
export class UsersController {

  constructor(private usersService: UsersService) {
  }

  @Get('/current')
  async current(): Promise<User> {
    return this.usersService.getCurrent();
  }

  @Put('/language/:lang')
  updateLanguage(@Param('lang', new ParseEnumPipe(ClSupportedLanguage)) lang: ClSupportedLanguage): Promise<void> {
    return this.usersService.updateLanguage(lang);
  }

  @Put('/theme/:theme')
  updateTheme(@Param('theme', new ParseEnumPipe(ClTheme)) theme: ClTheme): Promise<void> {
    return this.usersService.updateTheme(theme);
  }


  @UserCategories(UserCategory.ADMIN)
  @Get('')
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }


}
