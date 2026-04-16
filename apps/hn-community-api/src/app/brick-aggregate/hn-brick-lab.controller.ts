import { BlPublic } from '@monorepo/back-core-lib';
import { Controller, Get, Param } from '@nestjs/common';

import { HnBrickVersionCloneInfoDTO } from './brick/hn-brick.dto';
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
}
