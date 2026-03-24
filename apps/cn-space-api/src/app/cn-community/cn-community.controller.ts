import { ClPage } from '@monorepo/core-lib';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';

import { CnCommunityService } from './cn-community.service';
import { CnCommunityBrickDto, CnCommunityBrickVersionDTO } from './dto/cn-community-brick.dto';

@Controller('community/:labId')
export class CnCommunityController {
  constructor(private readonly communityService: CnCommunityService) {}

  @Get('brick/:name')
  async getCommunityBrickByName(
    @Param('labId') labId: string,
    @Param('name') name: string
  ): Promise<CnCommunityBrickDto> {
    return this.communityService.getBrickByName(labId, name);
  }

  @Get('brick/:name/latest')
  async getCommunityBrickLastVersionByName(
    @Param('labId') labId: string,
    @Param('name') name: string
  ): Promise<CnCommunityBrickVersionDTO> {
    return this.communityService.getBrickLatestVersion(labId, name);
  }

  @Get('brick/:name/version/:version')
  async getCommunityBrickVersion(
    @Param('labId') labId: string,
    @Param('name') name: string,
    @Param('version') version: string
  ): Promise<CnCommunityBrickVersionDTO> {
    return this.communityService.getBrickVersion(labId, name, version);
  }

  @Post('brick/filters')
  async getCommunityBricksByFilters(
    @Param('labId') labId: string,
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnCommunityBrickDto>> {
    return this.communityService.getBricksByFilters(labId, spacesFilter, titleFilter, page, size);
  }

  @Get('brick/versions-list/:brickId')
  async getCommunityBrickVersionsList(
    @Param('labId') labId: string,
    @Param('brickId') brickId: string
  ): Promise<string[]> {
    return this.communityService.getBrickVersionsList(labId, brickId);
  }
}
