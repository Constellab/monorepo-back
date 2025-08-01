import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnAgentCoAuthorModule } from '../agent-co-author/hn-agent-co-author.module';
import { HnAgent } from './hn-agent.entity';
import { HnAgentService } from './hn-agent.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnAgent]), HnAgentCoAuthorModule],
  exports: [TypeOrmModule, HnAgentService],
  providers: [HnAgentService],
})
export class HnAgentModule {}
