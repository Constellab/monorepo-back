import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../core/hn-core.module';
import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnCommunitySecurityModule } from '../core/security/hn-community-security.module';
import { HnFileStoryModule } from '../file-aggregate/file-story/hn-file-story.module';
import { HnFileStoryService } from '../file-aggregate/file-story/hn-file-story.service';
import { HnStoryAuthorModule } from '../story-author/hn-story-author.module';
import { HnStoryAuthorService } from '../story-author/hn-story-author.service';
import { HnStoryAuthorInviteModule } from '../story-author-invite/hn-story-author-invite.module';
import { HnStoryAuthorInviteService } from '../story-author-invite/hn-story-author-invite.service';
import { HnTopicModule } from '../topic/hn-topic.module';
import { HnTopicService } from '../topic/hn-topic.service';
import { HnUserModule } from '../users/hn-user.module';
import { HnStoryController } from './hn-story.controller';
import { HnStory } from './hn-story.entity';
import { HnCommunityStoryListener } from './hn-story.listener';
import { HnStoryService } from './hn-story.service';
import { HnStorySecurity } from './security/hn-story.security';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnStory]),

    HnCoreModule,
    HnCommunitySecurityModule,
    HnTopicModule,
    HnStoryAuthorModule,
    HnUserModule,
    HnStoryAuthorInviteModule,
    HnFileStoryModule,
    HnCoreConfigModule,
  ],
  exports: [TypeOrmModule, HnStoryService],
  controllers: [HnStoryController],
  providers: [
    HnStoryService,
    HnStorySecurity,
    HnTopicService,
    HnStoryAuthorService,
    HnStoryAuthorInviteService,
    HnFileStoryService,
    HnCommunityStoryListener,
  ],
})
export class HnStoryModule {}
