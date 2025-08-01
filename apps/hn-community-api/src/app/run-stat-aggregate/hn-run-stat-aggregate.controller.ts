import { BlPublic } from '@monorepo/back-core-lib';
import { Controller, Get, Param, Put } from '@nestjs/common';

import { IsAdmin } from '../core/decorators/hn-is-admin.decorator';
import { HnRunStatAgService } from './hn-run-stat-ag.service';
import {
  HnRunStatAggregate,
  HnRunStatAggregateObjectType,
} from './run-stat-aggregate/hn-run-stat-aggregate.entity';

@Controller('run-stat-aggregate')
export class HnRunStatAggregateController {
  constructor(private readonly runStatAgService: HnRunStatAgService) {}

  @BlPublic()
  @Get(':objectType/:objectId')
  async getObjectRunStatGroup(
    @Param('objectType') objectType: HnRunStatAggregateObjectType,
    @Param('objectId') objectId: string
  ): Promise<HnRunStatAggregate> {
    return this.runStatAgService.getObjectRunStatGroup(objectId, objectType);
  }

  @IsAdmin()
  @Put('migrate-run-stats')
  async migrateRunStats(): Promise<void> {
    return this.runStatAgService.migrateRunStats();
  }
}
