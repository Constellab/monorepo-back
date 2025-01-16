import { Module } from '@nestjs/common';
import { HnRunStatModule } from './run-stat/hn-run-stat.module';
import { HnRunStatAgService } from './hn-run-stat-ag.service';
import { HnRunStatLabController } from './hn-run-stat-lab.controller';
import { HnRunStatAggregateController } from './hn-run-stat-aggregate.controller';
import { BlExternalApiModule } from '@monorepo/back-core-lib';
import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnCoreModule } from '../core/hn-core.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnAgentAggregateModule } from '../agent-aggregate/hn-agent-aggregate.module';
import { HnBrickAggregateModule } from '../brick-aggregate/hn-brick-aggregate.module';
import { HnRunStatAggregateModule } from './run-stat-aggregate/hn-run-stat-aggregate.module';

@Module({
  imports: [
    HnRunStatModule,
    HnRunStatAggregateModule,
    BlExternalApiModule,
    HnCoreConfigModule,
    HnCoreModule,
    HnUserModule,
    HnAgentAggregateModule,
    HnBrickAggregateModule,
  ],
  providers: [HnRunStatAgService],
  controllers: [HnRunStatAggregateController, HnRunStatLabController],
  exports: [HnRunStatAgService],
})
export class HnRunStatAgModule {}
