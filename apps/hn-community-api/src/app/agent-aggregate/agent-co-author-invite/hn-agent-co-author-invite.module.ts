import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnAgentCoAuthorInvite } from './hn-agent-co-author-invite.entity';
import { HnAgentCoAuthorInviteService } from './hn-agent-co-author-invite.service';
import { HnUserModule } from '../../users/hn-user.module';
import { HnFrontService } from '../../core/service/hn-front.service';
import { HnCoreConfigModule } from '../../core/modules/core-config/hn-core-config.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnAgentCoAuthorInvite]), HnUserModule, HnCoreConfigModule],
  exports: [TypeOrmModule, HnAgentCoAuthorInviteService],
  providers: [HnAgentCoAuthorInviteService, HnFrontService],
})
export class HnAgentCoAuthorInviteModule {}
