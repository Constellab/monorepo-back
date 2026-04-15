import { Controller, Get, Param } from '@nestjs/common';

import {
  HnLabAllowWithoutUserAuthentication,
  HnLabGuard,
} from '../core/decorators/hn-lab-auth-guard.decorator';
import { HnBrickVersionDownloadDTO } from './brick/hn-brick.dto';
import { HnBrickAggregateService } from './hn-brick-aggregate.service';

/**
 * Controller for lab-facing brick routes.
 * Uses lab authentication (the lab sends its API key, community verifies it via the space API).
 */
@HnLabGuard()
@Controller('lab/brick')
export class HnBrickLabController {
  constructor(private readonly brickAggregateService: HnBrickAggregateService) {}

  @HnLabAllowWithoutUserAuthentication()
  @Get('download/:name/:version')
  getBrickVersionForDownload(
    @Param('name') name: string,
    @Param('version') version: string
  ): Promise<HnBrickVersionDownloadDTO> {
    return this.brickAggregateService.getBrickVersionForDownload(name, version);
  }
}
