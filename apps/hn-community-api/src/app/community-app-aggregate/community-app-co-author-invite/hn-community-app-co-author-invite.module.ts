import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreConfigModule } from '../../core/modules/core-config/hn-core-config.module';
import { HnFrontService } from '../../core/service/hn-front.service';
import { HnUserModule } from '../../users/hn-user.module';
import { HnCommunityAppCoAuthorInvite } from './hn-community-app-co-author-invite.entity';
import { HnCommunityAppCoAuthorInviteService } from './hn-community-app-co-author-invite.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnCommunityAppCoAuthorInvite]), HnUserModule, HnCoreConfigModule],
  exports: [TypeOrmModule, HnCommunityAppCoAuthorInviteService],
  providers: [HnCommunityAppCoAuthorInviteService, HnFrontService],
})
export class HnCommunityAppCoAuthorInviteModule {}
