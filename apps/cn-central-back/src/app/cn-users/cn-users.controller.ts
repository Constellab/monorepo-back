import {Controller, Get, Param, Put} from '@nestjs/common';
import {CnUsersService} from './cn-users.service';
import {CnUser} from './cn-user.entity';
import {CnUserCategories} from '../cn-core/decorators/cn-user-category.decorator';
import {ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {CmUserCategory} from '@monorepo/common-model';
import {BlParseEnumPipe} from '@monorepo/back-core-lib';

@Controller('users')
export class CnUsersController {

  constructor(private usersService: CnUsersService) {
  }

  @Get('/current')
  async current(): Promise<CnUser> {
    return this.usersService.getCurrent();
  }

  @Put('/language/:lang')
  updateLanguage(@Param('lang', new BlParseEnumPipe(ClSupportedLanguage)) lang: ClSupportedLanguage): Promise<void> {
    return this.usersService.updateLanguage(lang);
  }

  @Put('/theme/:theme')
  updateTheme(@Param('theme', new BlParseEnumPipe(ClTheme)) theme: ClTheme): Promise<void> {
    return this.usersService.updateTheme(theme);
  }


  @CnUserCategories(CmUserCategory.ADMIN)
  @Get('')
  findAll(): Promise<CnUser[]> {
    return this.usersService.findAll();
  }


}
