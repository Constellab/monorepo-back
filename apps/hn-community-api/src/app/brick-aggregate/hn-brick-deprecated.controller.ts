import { BlPublic } from '@monorepo/back-core-lib';
import { Controller, Get, Param, Req } from '@nestjs/common';
import { Request } from 'express';

import {
  HnLabAllowWithoutUserAuthentication,
  HnLabGuard,
} from '../core/decorators/hn-lab-auth-guard.decorator';
import { HnBrickVersionDownloadDTO } from './brick/hn-brick.dto';
import { HnBrickAggregateService } from './hn-brick-aggregate.service';

/**
 * @deprecated Controller containing legacy routes for backward compatibility.
 * Remove once all lab managers are on v1.20+ and labs are on v0.15.0+.
 */
@Controller('brick')
export class HnBrickDeprecatedController {
  constructor(private readonly brickAggregateService: HnBrickAggregateService) {}

  /**
   * @deprecated Called by labs using the space API key (X-Api-Key header).
   */
  @BlPublic()
  @Get(['central/name/:name/:version', 'space/name/:name/:version'])
  findOneByNameSpace(
    @Param('name') name: string,
    @Param('version') version: string,
    @Req() request: Request
  ): Promise<HnBrickVersionDownloadDTO> {
    return this.brickAggregateService.findBrickByNameSpace(name, version, request.header('X-Api-Key'));
  }

  /**
   * @deprecated Called by labs using lab authentication.
   */
  @HnLabGuard()
  @HnLabAllowWithoutUserAuthentication()
  @Get('for-space/name/:name/:version')
  getBrickVersionForDownload(
    @Param('name') name: string,
    @Param('version') version: string
  ): Promise<HnBrickVersionDownloadDTO> {
    return this.brickAggregateService.getBrickVersionForDownload(name, version);
  }
}
