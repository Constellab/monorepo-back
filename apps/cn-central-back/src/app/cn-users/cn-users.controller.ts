import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import {CnUsersService} from './cn-users.service';
import {CnUser, CnUserEditDTO} from './cn-user.entity';
import {CnUserCategories} from '../cn-core/decorators/cn-user-category.decorator';
import {ClPage, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {CmUserCategory} from '@monorepo/common-model';
import {
  BlFile,
  BlParseEnumPipe,
  BlParsePipe,
  BlPublic,
  BlResponseHelper,
  BlSearchParams
} from '@monorepo/back-core-lib';
import {FilesInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';

@Controller('users')
export class CnUsersController {

  constructor(private usersService: CnUsersService) {
  }

  @Get('current')
  async current(): Promise<CnUser> {
    return this.usersService.getCurrent();
  }

  @Put('current/language/:lang')
  updateLanguage(@Param('lang', new BlParseEnumPipe(ClSupportedLanguage)) lang: ClSupportedLanguage): Promise<void> {
    return this.usersService.updateLanguage(lang);
  }

  @Put('current/theme/:theme')
  updateTheme(@Param('theme', new BlParseEnumPipe(ClTheme)) theme: ClTheme): Promise<void> {
    return this.usersService.updateTheme(theme);
  }


  @CnUserCategories(CmUserCategory.ADMIN)
  @Get()
  findAll(@Query('page', new ParseIntPipe()) page: number,
          @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnUser>> {
    return this.usersService.findAllPaginated(page, size);
  }

  @Put('current/edit')
  editUser(@Body(new BlParsePipe(CnUserEditDTO)) userEdit: CnUserEditDTO): Promise<CnUser> {
    return this.usersService.editUser(userEdit);
  }

  @UseInterceptors(FilesInterceptor('photo'))
  @Put('current/photo/:userId')
  saveNewPhoto(@Param('userId') userId: string, @UploadedFiles() files: BlFile[]): Promise<CnUser> {
    return files[0] ? this.usersService.saveNewPhoto(files[0], userId) : null;
  }

  @BlPublic()
  @Get('photo/:userId')
  public async getUserPhoto(@Param('userId') userId: string,
                            @Res() response: Response): Promise<any> {
    const file = await this.usersService.getUserPhoto(userId);
    BlResponseHelper.setMessage(response, file);
  }

  @Get('current/2-fa')
  public async get2FA(): Promise<{ enabled: boolean }> {
    return {enabled: this.usersService.getCurrent().has2FA};
  }

  @Put('current/2-fa')
  public async set2FA(@Body('enabled') enabled: boolean): Promise<{ enabled: boolean }> {
    const enable = await this.usersService.set2FA(enabled);
    return {enabled: enable};
  }

  @Post('search')
  public async search(@Body(new BlParsePipe(BlSearchParams)) searchParams: BlSearchParams,
                      @Query('page', new ParseIntPipe()) page: number,
                      @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnUser>> {
    return this.usersService.search(searchParams, page, size);
  }
}
