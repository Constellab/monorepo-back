import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreConfigModule } from '../../core/modules/core-config/hn-core-config.module';
import { HnFrontService } from '../../core/service/hn-front.service';
import { HnUserModule } from '../../users/hn-user.module';
import { HnTagCoAuthorInvite } from './hn-tag-co-author-invite.entity';
import { HnTagCoAuthorInviteService } from './hn-tag-co-author-invite.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnTagCoAuthorInvite]), HnUserModule, HnCoreConfigModule],
  exports: [TypeOrmModule, HnTagCoAuthorInviteService],
  providers: [HnTagCoAuthorInviteService, HnFrontService],
})
export class HnTagCoAuthorInviteModule {}
