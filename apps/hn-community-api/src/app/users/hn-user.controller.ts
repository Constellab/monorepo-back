import { BlParseEnumPipe, BlPublic } from '@monorepo/back-core-lib';
import { ClPage, ClSupportedLanguage, ClTheme } from '@monorepo/core-lib';
import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';

import { HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnUserDetailDto, HnUserDto, HnUserEditDetailDto } from './hn-user.dto';
import { HnUser, HnUserSearchFilters } from './hn-user.entity';
import { HnUserService } from './hn-user.service';

@Controller('user')
export class HnUserController {
  constructor(private readonly userService: HnUserService) {}

  @Get()
  getCurrent(): HnUser {
    return this.userService.getCurrent();
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

  @Post('search')
  async searchUser(
    @Body() filters: Partial<HnUserSearchFilters>,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPage<HnUserDto>> {
    const users = await this.userService.search(filters, page, size);
    return users.map((user) => new HnUserDto(user));
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
