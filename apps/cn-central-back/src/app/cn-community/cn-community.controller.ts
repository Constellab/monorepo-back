import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CnCommunityBrickDto } from './dto/cn-community-brick.dto';
import { ClPage } from '@monorepo/core-lib';
import { CnCommunityService } from './cn-community.service';

@Controller('community')
export class CnCommunityController {
  constructor(private readonly communityService: CnCommunityService) {}

  @Get('brick/name/:name')
  async getCommunityBrickByName(@Param('name') name: string): Promise<CnCommunityBrickDto> {
    return this.communityService.getCommunityBrickByName(name);
  }

  @Post('brick/filters')
  async getCommunityBricksByFilters(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnCommunityBrickDto>> {
    return this.communityService.getCommunityBricksByFilters(spacesFilter, titleFilter, page, size);
  }

  @Get('brick/versions-list/:brickId')
  async getCommunityBrickVersionsList(@Param('brickId') brickId: string): Promise<string[]> {
    return this.communityService.getCommunityBrickVersionsList(brickId);
  }
}
