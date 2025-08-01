import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../core/hn-core.module';
import { HnStoryAuthorInviteModule } from '../story-author-invite/hn-story-author-invite.module';
import { HnStoryAuthorInviteService } from '../story-author-invite/hn-story-author-invite.service';
import { HnUserModule } from '../users/hn-user.module';
import { HnStoryAuthorController } from './hn-story-author.controller';
import { HnStoryCoAuthor } from './hn-story-author.entity';
import { HnStoryAuthorService } from './hn-story-author.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnStoryCoAuthor]),

    HnCoreModule,
    HnUserModule,
    HnStoryAuthorInviteModule,
  ],
  exports: [TypeOrmModule],
  controllers: [HnStoryAuthorController],
  providers: [HnStoryAuthorService, HnStoryAuthorInviteService],
})
export class HnStoryAuthorModule {}
