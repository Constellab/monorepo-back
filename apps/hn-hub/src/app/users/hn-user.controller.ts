import { Body, Controller, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { HnUserService } from './hn-user.service';
import { HnUser } from './hn-user.entity';
import { BlParseEnumPipe, BlPublic } from '@monorepo/back-core-lib';
import { ClSupportedLanguage, ClTheme } from '@monorepo/core-lib';
import { HnUserDetailDto, HnUserEditDetailDto } from './hn-user.dto';
import { HnSitemapItemBase } from '../core/model/config/hn-site-map.class';

@Controller('user')
export class HnUserController {
  constructor(private readonly userService: HnUserService) {}

  @Get()
  async getCurrent(): Promise<HnUser> {
    return await this.userService.getCurrent();
  }

  @BlPublic()
  @Get('count')
  async getCount(): Promise<number> {
    return await this.userService.getCount();
  }

  @BlPublic()
  @Get('all-map')
  async getAllAgentsMap(): Promise<HnSitemapItemBase[]> {
    return this.userService.getAllUsersMap();
  }

  @BlPublic()
  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnUserDetailDto> {
    return await this.userService.getUserById(id);
  }

  @Put('theme/:theme')
  async changeTheme(@Param('theme', new BlParseEnumPipe(ClTheme)) theme: ClTheme): Promise<void> {
    return this.userService.changeTheme(theme);
  }

  @Put('lang/:lang')
  async changeLang(
    @Param('lang', new BlParseEnumPipe(ClSupportedLanguage)) lang: ClSupportedLanguage
  ): Promise<void> {
    return this.userService.changeLang(lang);
  }

  @Put('edit')
  async editUser(@Body() data: HnUserEditDetailDto): Promise<HnUserDetailDto> {
    return this.userService.editUser(data);
  }
}
