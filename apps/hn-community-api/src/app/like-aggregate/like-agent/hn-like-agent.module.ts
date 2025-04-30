import { Module } from '@nestjs/common';
import { HnLikeAgentService } from './hn-like-agent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnLikeAgent } from './hn-like-agent.entity';
import { HnAgentAggregateModule } from '../../agent-aggregate/hn-agent-aggregate.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnLikeAgent]), HnAgentAggregateModule],
  providers: [HnLikeAgentService],
  exports: [TypeOrmModule, HnLikeAgentService],
})
export class HnLikeAgentModule {}
