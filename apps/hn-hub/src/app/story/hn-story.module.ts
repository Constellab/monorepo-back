import {Module} from '@nestjs/common';
import {HnStoryService} from './hn-story.service';
import {HnStoryController} from './hn-story.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnStory} from './hn-story.entity';
import {HnTopicService} from '../topic/hn-topic.service';
import {HnTopicModule} from '../topic/hn-topic.module';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {HnUserModule} from '../users/hn-user.module';
import {HnStoryAuthorModule} from '../story-author/hn-story-author.module';
import {HnStoryAuthorService} from '../story-author/hn-story-author.service';
import {HnStoryAuthorInviteModule} from '../story-author-invite/hn-story-author-invite.module';
import {HnStoryAuthorInviteService} from '../story-author-invite/hn-story-author-invite.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnStory]), HnTopicModule, HnStoryAuthorModule, HnUserModule, HnStoryAuthorInviteModule],
  exports: [TypeOrmModule],
  controllers: [HnStoryController],
  providers: [HnStoryService, HnTopicService, HnCoreConfigService, HnStoryAuthorService, HnStoryService, HnStoryAuthorInviteService],
})
export class HnStoryModule {
}
