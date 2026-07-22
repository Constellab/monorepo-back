import { BlParsePipe, BlPublic } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';

import {
  HnLabAllowWithoutUserAuthentication,
  HnLabGuard,
} from '../core/decorators/hn-lab-auth-guard.decorator';
import {
  HnBrickDto,
  HnBrickInfoDTO,
  HnBrickVersionCloneInfoDTO,
  HnBrickVersionInfoDTO,
  HnMultipleBrickInfoInputDTO,
} from './brick/hn-brick.dto';
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

  /**
   * List public bricks for a lab. Public route: returns only bricks with
   * PUBLIC visibility and no space association — no lab auth required.
   */
  @BlPublic()
  @Post('search')
  getPublicBricksByFilter(
    @Body('titleFilter') titleFilter: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnBrickDto>> {
    return this.brickAggregateService.findPublicBricksWithFilter(titleFilter, page, size);
  }

  /**
   * Get summary info for multiple bricks at once. Lab-authenticated:
   * for each requested brick name/version, returns its id, name, description,
   * image, latest version and whether a newer version than the requested one
   * exists. Bricks that cannot be resolved are silently skipped, so the
   * response may be shorter than the request.
   */
  @HnLabGuard()
  @HnLabAllowWithoutUserAuthentication()
  @Post('info')
  getMultipleBrickInfo(
    @Body(new BlParsePipe(HnMultipleBrickInfoInputDTO)) input: HnMultipleBrickInfoInputDTO
  ): Promise<HnBrickInfoDTO[]> {
    return this.brickAggregateService.getMultipleBrickInfo(input.bricks);
  }

  /**
   * Get brick info by name. Lab-authenticated: returns brick details for
   * any brick (including private) without calling the space API —
   * access is controlled by the lab API key.
   */
  @HnLabGuard()
  @HnLabAllowWithoutUserAuthentication()
  @Get(':name')
  async findOneByName(@Param('name') name: string): Promise<HnBrickDto> {
    return new HnBrickDto(await this.brickAggregateService.findBrickByName(name, null, false));
  }

  /**
   * List versions for a brick by name. Lab-authenticated: returns versions
   * for any brick (including private) without calling the space API.
   */
  @HnLabGuard()
  @HnLabAllowWithoutUserAuthentication()
  @Get(':name/versions')
  getVersionsList(@Param('name') name: string): Promise<string[]> {
    return this.brickAggregateService.getVersionsListByName(name);
  }

  /**
   * Get brick version info by name and version. Lab-authenticated:
   * returns version info for any brick (including private) without
   * calling the space API.
   */
  @HnLabGuard()
  @HnLabAllowWithoutUserAuthentication()
  @Get(':name/:version')
  getBrickVersionInfo(
    @Param('name') name: string,
    @Param('version') version: string
  ): Promise<HnBrickVersionInfoDTO> {
    return this.brickAggregateService.getBrickVersionInfo(name, version);
  }

  /**
   * Get brick version clone info (including repository access URL).
   * Public route: private-brick access is enforced in the service via
   * checkLabBrickAccessByName using the lab API key.
   */
  @BlPublic()
  @Get(':name/:version/clone-info')
  getBrickVersionCloneInfo(
    @Param('name') name: string,
    @Param('version') version: string
  ): Promise<HnBrickVersionCloneInfoDTO> {
    return this.brickAggregateService.getBrickVersionCloneInfo(name, version);
  }
}
