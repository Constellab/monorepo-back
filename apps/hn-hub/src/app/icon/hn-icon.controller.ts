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
  Req,
  Res,
  UseInterceptors
} from '@nestjs/common';
import {HnIconService} from './hn-icon.service';
import {ClPage} from '@monorepo/core-lib';
import {HnIcon} from './hn-icon.entity';
import {BlFile, BlPublic, BlResponseHelper, BlUploadedFile} from '@monorepo/back-core-lib';
import {Response} from 'express';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';
import {FileInterceptor} from '@nestjs/platform-express';
import {HnIconCreateDto} from './hn-icon.dto';

@Controller('icon')
export class HnIconController {
  constructor(private readonly iconService: HnIconService) {
  }

  @BlPublic()
  @Get()
  async getIcons(@Query('page', new ParseIntPipe()) page: number,
                 @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnIcon>> {
    return await this.iconService.getIcons(page, size);
  }

  @BlPublic()
  @Get('file/:technicalName')
  async getIconUrl(@Req() request: Request,
                   @Res() response: Response): Promise<any> {
    const technicalName = request.url.split('file/')[1];
    const file = await this.iconService.getIconFile(technicalName);
    BlResponseHelper.setMessageAndCache(response, file);
  }

  @BlPublic()
  @Get('technical-name/:technicalName')
  async getIconByTechnicalName(@Param('technicalName') technicalName: string): Promise<HnIcon> {
    return await this.iconService.getIconByTechnicalName(technicalName);
  }

  @BlPublic()
  @Get(':id')
  async getIconById(@Param('id') id: string): Promise<HnIcon> {
    return await this.iconService.getIconById(id);
  }


  @IsAdmin()
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async createIcon(@BlUploadedFile() file: BlFile,
                   @Body('icon') iconStr: string): Promise<HnIcon> {
    const icon: HnIconCreateDto = JSON.parse(iconStr);
    return await this.iconService.createIcon(icon, file);
  }

  @BlPublic()
  @Post('filter')
  async filterIcons(@Body('subNameFilter') subNameFilter: string,
                    @Query('page', new ParseIntPipe()) page: number,
                    @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnIcon>> {
    return await this.iconService.filterIcons(subNameFilter, page, size);
  }

  @IsAdmin()
  @UseInterceptors(FileInterceptor('file'))
  @Put()
  async updateIcon(@BlUploadedFile() file: BlFile,
                   @Body('icon') iconStr: string): Promise<HnIcon> {
    const icon: HnIconCreateDto = JSON.parse(iconStr);
    return await this.iconService.updateIcon(icon, file);
  }

  @IsAdmin()
  @Delete(':id')
  async deleteIcon(@Param('id') id: string): Promise<boolean> {
    return await this.iconService.deleteIcon(id);
  }

}
