import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnAgentAggregateModule } from '../../agent-aggregate/hn-agent-aggregate.module';
import { HnCommentAgent } from './hn-comment-agent.entity';
import { HnCommentAgentService } from './hn-comment-agent.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnCommentAgent]), HnAgentAggregateModule],
  providers: [HnCommentAgentService],
  exports: [TypeOrmModule, HnCommentAgentService],
})
export class HnCommentAgentModule {}
