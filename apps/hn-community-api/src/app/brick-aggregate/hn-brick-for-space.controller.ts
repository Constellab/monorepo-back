import { ClPage } from '@monorepo/core-lib';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';

import {
  HnLabAllowWithoutUserAuthentication,
  HnLabGuard,
} from '../core/decorators/hn-lab-auth-guard.decorator';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import {
  HnBrickDto,
  HnBrickVersionDownloadDTO,
  HnBrickVersionInfoDTO,
} from './brick/hn-brick.dto';
import { HnBrickAggregateService } from './hn-brick-aggregate.service';

@HnLabGuard()
@Controller('brick/for-space')
export class HnBrickForSpaceController {
  constructor(private readonly brickAggregateService: HnBrickAggregateService) {}

  @Get('name/:name')
  async findOneByName(@Param('name') name: string): Promise<HnBrickDto> {
    return new HnBrickDto(
      await this.brickAggregateService.findBrickByNameForSpace(name)
    );
  }

  @Get('version-info/:name/:version')
  getBrickVersionInfo(
    @Param('name') name: string,
    @Param('version') version: string
  ): Promise<HnBrickVersionInfoDTO> {
    return this.brickAggregateService.getBrickVersionInfo(
      name,
      version
    );
  }

  @HnLabAllowWithoutUserAuthentication()
  @Get('name/:name/:version')
  getBrickVersionForDownload(
    @Param('name') name: string,
    @Param('version') version: string
  ): Promise<HnBrickVersionDownloadDTO> {
    return this.brickAggregateService.getBrickVersionForDownload(name, version);
  }

  @Post('filters')
  async getBricksByFilter(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnBrickDto>> {
    const userId = HnCurrentUserHelper.getAndCheckCurrentUser().id;
    return this.brickAggregateService.findBricksWithFilter(spacesFilter, titleFilter, [], page, size, userId);
  }

  @Get('versions-list/:brickId')
  async getVersionsList(@Param('brickId') brickId: string): Promise<string[]> {
    return this.brickAggregateService.getVersionsListForSpace(brickId);
  }
}
