import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnAgentCoAuthorInviteModule } from '../agent-co-author-invite/hn-agent-co-author-invite.module';
import { HnAgentCoAuthor } from './hn-agent-co-author.entity';
import { HnAgentCoAuthorService } from './hn-agent-co-author.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnAgentCoAuthor]), HnAgentCoAuthorInviteModule],
  exports: [TypeOrmModule, HnAgentCoAuthorService],
  providers: [HnAgentCoAuthorService],
})
export class HnAgentCoAuthorModule {}
