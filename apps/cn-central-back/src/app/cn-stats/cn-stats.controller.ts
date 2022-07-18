import {Controller, Get,} from '@nestjs/common';
import {CnStatsService} from './cn-stats.service';
import {CnStats} from './cn-stats.class';

@Controller('stats')
export class CnStatsController {
  constructor(private readonly statsService: CnStatsService) {
  }

  @Get()
  getStats(): Promise<CnStats> {
    return this.statsService.getStats();
  }
}
