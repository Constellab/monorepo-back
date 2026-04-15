import { ClPage } from '@monorepo/core-lib';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';

import { HnSpaceGuard } from '../core/decorators/hn-space-auth-guard.decorator';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnBrickDto, HnBrickVersionInfoDTO } from './brick/hn-brick.dto';
import { HnBrickAggregateService } from './hn-brick-aggregate.service';

@HnSpaceGuard()
@Controller('space/brick')
export class HnBrickSpaceController {
  constructor(private readonly brickAggregateService: HnBrickAggregateService) {}

  @Get('name/:name')
  async findOneByName(@Param('name') name: string): Promise<HnBrickDto> {
    return new HnBrickDto(await this.brickAggregateService.findBrickByName(name));
  }

  @Get('version-info/:name/:version')
  getBrickVersionInfo(
    @Param('name') name: string,
    @Param('version') version: string
  ): Promise<HnBrickVersionInfoDTO> {
    return this.brickAggregateService.getBrickVersionInfo(name, version);
  }

  @Post('filters')
  async getBricksByFilter(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnBrickDto>> {
    return this.brickAggregateService.findBricksWithFilter(
      spacesFilter,
      titleFilter,
      [],
      page,
      size,
      HnCurrentUserHelper.getAndCheckCurrentUser()
    );
  }
}
