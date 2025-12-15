import {
  BlFile,
  BlParseEnumPipe,
  BlParsePipe,
  BlPublic,
  BlResponseHelper,
  BlSearchParams,
  BlUploadedFile,
  BlUserCategory,
} from '@monorepo/back-core-lib';
import { ClPage, ClSupportedLanguage, ClTheme } from '@monorepo/core-lib';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { CnUserCategories } from '../cn-core/decorators/cn-user-category.decorator';
import { CnUser, CnUserEditDTO } from './cn-user.entity';
import { CnUsersService } from './cn-users.service';

@Controller('users')
export class CnUsersController {
  constructor(private usersService: CnUsersService) {}

  @Get('current')
  current(): CnUser {
    return this.usersService.getAndCheckCurrentUser();
  }

  @Put('current/language/:lang')
  updateLanguage(
    @Param('lang', new BlParseEnumPipe(ClSupportedLanguage)) lang: ClSupportedLanguage
  ): Promise<void> {
    return this.usersService.updateLanguage(lang);
  }

  @Put('current/theme/:theme')
  updateTheme(@Param('theme', new BlParseEnumPipe(ClTheme)) theme: ClTheme): Promise<void> {
    return this.usersService.updateTheme(theme);
  }

  // TODO: remove this endpoint when the community user status check is stable
  @BlPublic()
  @Get('valid/:id')
  findOneValid(@Param('id') id: string): Promise<CnUser> {
    return this.usersService.findOneValid(id);
  }

  @CnUserCategories(BlUserCategory.ADMIN)
  @Get()
  findAll(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnUser>> {
    return this.usersService.findAllPaginated(page, size);
  }

  @Put('current/edit')
  updateUser(@Body(new BlParsePipe(CnUserEditDTO)) userEdit: CnUserEditDTO): Promise<CnUser> {
    return this.usersService.updateUser(userEdit);
  }

  @UseInterceptors(FileInterceptor('photo'))
  @Put('current/photo')
  updatePhoto(@BlUploadedFile() file: BlFile): Promise<CnUser> {
    return this.usersService.uploadCurrentUserPhoto(file);
  }

  @Delete('current/photo')
  deletePhoto(): Promise<CnUser> {
    return this.usersService.deleteCurrentPhoto();
  }

  @BlPublic()
  @Get('photo-v2/:photoId')
  public async getUserPhoto(@Param('photoId') photoId: string, @Res() response: Response): Promise<any> {
    const file = await this.usersService.getUserPhoto(photoId);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  @Get('current/2-fa')
  public get2FA(): { enabled: boolean } {
    return { enabled: this.usersService.getAndCheckCurrentUser().has2FA };
  }

  @Put('current/2-fa')
  public async set2FA(@Body('enabled') enabled: boolean): Promise<{ enabled: boolean }> {
    const enable = await this.usersService.set2FA(enabled);
    return { enabled: enable };
  }

  @Post('search')
  public async search(
    @Body(new BlParsePipe(BlSearchParams)) searchParams: BlSearchParams,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnUser>> {
    return this.usersService.search(searchParams, page, size);
  }

  @Post('search/export')
  public async exportSearch(
    @Body(new BlParsePipe(BlSearchParams)) searchParams: BlSearchParams,
    @Res() res: Response
  ): Promise<void> {
    const users = await this.usersService.exportSearch(searchParams);

    BlResponseHelper.setFileResponseFromStr(res, users, 'users.csv', 'text/csv');
  }

  @Get('search/name/:name')
  public async searchByName(
    @Param('name') name: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnUser>> {
    return this.usersService.smartSearchByName(name, page, size);
  }

  @Post('send-all-to-queue')
  sendAllToQueue(): Promise<void> {
    return this.usersService.sendAllUsersToQueue();
  }
}
