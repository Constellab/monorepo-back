import { Body, Controller, Post } from '@nestjs/common';

import {
  HnLabAllowWithoutUserAuthentication,
  HnLabGuard,
} from '../core/decorators/hn-lab-auth-guard.decorator';
import { HnRunStatAgService } from './hn-run-stat-ag.service';
import { HnRunStatFromLabDto } from './run-stat/hn-run-stat.dto';

@HnLabGuard()
@Controller('run-stat-lab')
export class HnRunStatLabController {
  constructor(private readonly runStatAgService: HnRunStatAgService) {}

  @HnLabAllowWithoutUserAuthentication()
  @Post('new-stats')
  async createNewStatsFromLab(@Body('stats') stats: HnRunStatFromLabDto[]): Promise<void> {
    return this.runStatAgService.createNewStatsFromLab(stats);
  }
}
