import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import {CnUsersService} from './cn-users.service';
import {CnUser, CnUserEditDTO} from './cn-user.entity';
import {CnUserCategories} from '../cn-core/decorators/cn-user-category.decorator';
import {ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {CmUserCategory} from '@monorepo/common-model';
import {BlFile, BlParseEnumPipe, BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
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

  @UseInterceptors(FilesInterceptor('userNewPhoto'))
  @Post('edit')
  editUser(@Body( new BlParsePipe(CnUserEditDTO)) userEdit: CnUserEditDTO): Promise<CnUser>{
    console.log(userEdit);
    return this.usersService.editUser(userEdit);
  }

  @UseInterceptors(FilesInterceptor('photo'))
  @Put('new-photo/:userId')
  saveNewPhoto(@Param('userId') userId: string, @UploadedFiles() files: BlFile[]): Promise<CnUser>{
    console.log(files)
    return files[0] ? this.usersService.saveNewPhoto(files[0], userId) : null;
  }

  @Get('photo/:userId')
  public async getUserPhoto(@Param('userId') userId: string,
                   @Res() response: Response): Promise<any> {
    const file = await this.usersService.getUserPhoto(userId);
    file.pipe(response);
  }

}
