import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../core/hn-core.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnUserService } from '../users/hn-user.service';
import { HnStoryAuthorInviteController } from './hn-story-author-invite.controller';
import { HnStoryCoAuthorInvite } from './hn-story-author-invite.entity';
import { HnStoryAuthorInviteService } from './hn-story-author-invite.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnStoryCoAuthorInvite]), HnUserModule, HnCoreModule],
  exports: [TypeOrmModule],
  controllers: [HnStoryAuthorInviteController],
  providers: [HnStoryAuthorInviteService, HnUserService],
})
export class HnStoryAuthorInviteModule {}
