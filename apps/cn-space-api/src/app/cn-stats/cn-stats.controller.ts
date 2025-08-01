import { Controller, Get } from '@nestjs/common';

import { CnStats } from './cn-stats.class';
import { CnStatsService } from './cn-stats.service';

@Controller('stats')
export class CnStatsController {
  constructor(private readonly statsService: CnStatsService) {}

  @Get()
  getStats(): Promise<CnStats> {
    return this.statsService.getStats();
  }
}
