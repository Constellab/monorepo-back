import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import {BlFile, BlParseEnumPipe, BlParsePipe, BlPublic, BlResponseHelper} from '@monorepo/back-core-lib';
import {FilesInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';

@Controller('users')
export class CnUsersController {

  constructor(private usersService: CnUsersService) {
  }

  @Get('/current')
  async current(): Promise<CnUser> {
    return this.usersService.getCurrent();
  }

  @Get('/:id')
  async getById(@Param('id') id: string): Promise<CnUser> {
    return this.usersService.findOne(id);
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
  @Get()
  findAll(@Query('page', new ParseIntPipe()) page: number,
          @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnUser>> {
    return this.usersService.findAll(page, size);
  }

  @Put('edit')
  editUser(@Body(new BlParsePipe(CnUserEditDTO)) userEdit: CnUserEditDTO): Promise<CnUser> {
    return this.usersService.editUser(userEdit);
  }

  @UseInterceptors(FilesInterceptor('photo'))
  @Put('edit-photo/:userId')
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

}
