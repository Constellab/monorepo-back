import {Controller, Get, ParseIntPipe, Query, Req, Res} from '@nestjs/common';
import {HnIconService} from '../icon/hn-icon.service';
import {BlPublic, BlResponseHelper} from '@monorepo/back-core-lib';
import {Response} from 'express';
import {ClPage} from '@monorepo/core-lib';
import {HnIcon} from '../icon/hn-icon.entity';

@Controller('public')
export class HnPublicController {
  constructor(private readonly iconService: HnIconService) {
  }

  @BlPublic()
  @Get('icon')
  async getIcons(@Query('page', new ParseIntPipe()) page: number,
                 @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnIcon>> {
    return await this.iconService.getIcons(page, size);
  }

  @BlPublic()
  @Get('icon/file/:technicalName')
  async getIconUrl(@Req() request: Request,
                   @Res() response: Response): Promise<any> {
    const technicalName = request.url.split('file/')[1];
    const file = await this.iconService.getIconFile(technicalName);
    BlResponseHelper.setMessageAndCache(response, file);
  }
}
