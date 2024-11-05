import { Module } from '@nestjs/common';
import { HnStoryAuthorInviteService } from './hn-story-author-invite.service';
import { HnStoryAuthorInviteController } from './hn-story-author-invite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnStoryCoAuthorInvite } from './hn-story-author-invite.entity';
import { HnUserService } from '../users/hn-user.service';
import { HnUserModule } from '../users/hn-user.module';
import { HnCoreModule } from '../core/hn-core.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnStoryCoAuthorInvite]), HnUserModule, HnCoreModule],
  exports: [TypeOrmModule],
  controllers: [HnStoryAuthorInviteController],
  providers: [HnStoryAuthorInviteService, HnUserService],
})
export class HnStoryAuthorInviteModule {}
