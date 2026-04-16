import { BlPublic } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';

import {
  HnLabAllowWithoutUserAuthentication,
  HnLabGuard,
} from '../core/decorators/hn-lab-auth-guard.decorator';
import { HnBrickDto, HnBrickVersionCloneInfoDTO, HnBrickVersionInfoDTO } from './brick/hn-brick.dto';
import { HnBrickAggregateService } from './hn-brick-aggregate.service';

/**
 * Controller for lab-facing brick routes.
 * The clone-info route is public: private-brick access is enforced
 * in the service via checkLabBrickAccessByName using the lab API key
 * carried in the authorization header.
 */
@Controller('lab/brick')
export class HnBrickLabController {
  constructor(private readonly brickAggregateService: HnBrickAggregateService) {}

  @BlPublic()
  @Get(':name/:version/clone-info')
  getBrickVersionCloneInfo(
    @Param('name') name: string,
    @Param('version') version: string
  ): Promise<HnBrickVersionCloneInfoDTO> {
    return this.brickAggregateService.getBrickVersionCloneInfo(name, version);
  }

  /**
   * List public bricks for a lab. Public route: returns only bricks with
   * PUBLIC visibility and no space association — no lab auth required.
   */
  @BlPublic()
  @Post('filters')
  getPublicBricksByFilter(
    @Body('titleFilter') titleFilter: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnBrickDto>> {
    return this.brickAggregateService.findPublicBricksWithFilter(titleFilter, page, size);
  }

  /**
   * Get brick info by name. Lab-authenticated: returns brick details for
   * any brick (including private) without calling the space API —
   * access is controlled by the lab API key.
   */
  @HnLabGuard()
  @HnLabAllowWithoutUserAuthentication()
  @Get('name/:name')
  async findOneByName(@Param('name') name: string): Promise<HnBrickDto> {
    return new HnBrickDto(await this.brickAggregateService.findBrickByName(name, null, false));
  }

  /**
   * Get brick version info by name and version. Lab-authenticated:
   * returns version info for any brick (including private) without
   * calling the space API.
   */
  @HnLabGuard()
  @HnLabAllowWithoutUserAuthentication()
  @Get('version-info/:name/:version')
  getBrickVersionInfo(
    @Param('name') name: string,
    @Param('version') version: string
  ): Promise<HnBrickVersionInfoDTO> {
    return this.brickAggregateService.getBrickVersionInfo(name, version);
  }

  /**
   * List versions for a brick by name. Lab-authenticated: returns versions
   * for any brick (including private) without calling the space API.
   */
  @HnLabGuard()
  @HnLabAllowWithoutUserAuthentication()
  @Get('versions-list/:brickName')
  getVersionsList(@Param('brickName') brickName: string): Promise<string[]> {
    return this.brickAggregateService.getVersionsListByName(brickName);
  }
}
