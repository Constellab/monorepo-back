import { BlPublic, BlResponseHelper } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';

import { HnIcon } from '../icon/hn-icon.entity';
import { HnIconService } from '../icon/hn-icon.service';

@Controller('public')
export class HnPublicController {
  constructor(private readonly iconService: HnIconService) {}

  @BlPublic()
  @Get('icon')
  async getIcons(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnIcon>> {
    return await this.iconService.getIcons(page, size);
  }

  @BlPublic()
  @Get('icon/file/:technicalName')
  async getIconUrl(@Param('technicalName') technicalName: string, @Res() response: Response): Promise<any> {
    const file = await this.iconService.getIconFile(technicalName);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }
}
