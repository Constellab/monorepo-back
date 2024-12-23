import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CnCommunityBrickDto, CnCommunityBrickVersionDTO } from './dto/cn-community-brick.dto';
import { ClPage } from '@monorepo/core-lib';
import { CnCommunityService } from './cn-community.service';

@Controller('community')
export class CnCommunityController {
  constructor(private readonly communityService: CnCommunityService) {}

  @Get('brick/:name')
  async getCommunityBrickByName(@Param('name') name: string): Promise<CnCommunityBrickDto> {
    return this.communityService.getBrickByName(name);
  }

  @Get('brick/:name/latest')
  async getCommunityBrickLastVersionByName(@Param('name') name: string): Promise<CnCommunityBrickVersionDTO> {
    return this.communityService.getBrickLatestVersion(name);
  }

  @Get('brick/:name/version/:version')
  async getCommunityBrickVersion(
    @Param('name') name: string,
    @Param('version') version: string
  ): Promise<CnCommunityBrickVersionDTO> {
    return this.communityService.getBrickVersion(name, version);
  }

  @Post('brick/filters')
  async getCommunityBricksByFilters(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnCommunityBrickDto>> {
    return this.communityService.getBricksByFilters(spacesFilter, titleFilter, page, size);
  }

  @Get('brick/versions-list/:brickId')
  async getCommunityBrickVersionsList(@Param('brickId') brickId: string): Promise<string[]> {
    return this.communityService.getBrickVersionsList(brickId);
  }
}
