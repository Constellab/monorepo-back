import {Controller, Get, Param, Put} from '@nestjs/common';
import {HnUserService} from './hn-user.service';
import {HnUser, HnUserConstellabDTO} from './hn-user.entity';
import {EventPattern} from '@nestjs/microservices';
import {BlParseEnumPipe} from '@monorepo/back-core-lib';
import {ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';

@Controller('user')
export class HnUserController {
  constructor(private readonly userService: HnUserService) {
  }

  @Get()
  async getCurrent(): Promise<HnUser> {
    return await this.userService.getCurrent();
  }

  @EventPattern('user')
  handleUserCreated(userDto: HnUserConstellabDTO): Promise<void> {
    return this.userService.createOrUpdate(userDto);
  }

  @Put('theme/:theme')
  async changeTheme(@Param('theme', new BlParseEnumPipe(ClTheme)) theme: ClTheme): Promise<void> {
    return this.userService.changeTheme(theme);
  }

  @Put('lang/:lang')
  async changeLang(@Param('lang', new BlParseEnumPipe(ClSupportedLanguage)) lang: ClSupportedLanguage): Promise<void> {
    return this.userService.changeLang(lang);
  }
}
