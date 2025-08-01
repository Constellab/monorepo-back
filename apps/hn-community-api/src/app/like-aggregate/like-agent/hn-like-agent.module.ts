import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnAgentAggregateModule } from '../../agent-aggregate/hn-agent-aggregate.module';
import { HnLikeAgent } from './hn-like-agent.entity';
import { HnLikeAgentService } from './hn-like-agent.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnLikeAgent]), HnAgentAggregateModule],
  providers: [HnLikeAgentService],
  exports: [TypeOrmModule, HnLikeAgentService],
})
export class HnLikeAgentModule {}
