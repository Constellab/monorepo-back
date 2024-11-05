import { Body, Controller, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CnCommunityBrickDto } from './dto/cn-community-brick.dto';
import { ClPage } from '@monorepo/core-lib';
import { CnCommunityService } from './cn-community.service';

@Controller('community')
export class CnCommunityController {
  constructor(private readonly communityService: CnCommunityService) {}

  @Post('brick/name/:name')
  async getCommunityBrickByName(
    @Param('name') name: string,
    @Body('userId') userId: string
  ): Promise<CnCommunityBrickDto> {
    return this.communityService.getCommunityBrickByName(name, userId);
  }

  @Post('brick/filters')
  async getCommunityBricksByFilters(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Body('userId') userId: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnCommunityBrickDto>> {
    return this.communityService.getCommunityBricksByFilters(spacesFilter, titleFilter, userId, page, size);
  }

  @Post('brick/versions-list/:brickId')
  async getCommunityBrickVersionsList(
    @Param('brickId') brickId: string,
    @Body('userId') userId: string
  ): Promise<string[]> {
    return this.communityService.getCommunityBrickVersionsList(brickId, userId);
  }
}
