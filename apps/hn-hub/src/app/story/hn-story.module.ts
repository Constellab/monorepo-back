import {Module} from '@nestjs/common';
import {HnStoryService} from './hn-story.service';
import {HnStoryController} from './hn-story.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnStory} from './hn-story.entity';
import {HnTopicService} from '../topic/hn-topic.service';
import {HnTopicModule} from '../topic/hn-topic.module';
import {HnUserModule} from '../users/hn-user.module';
import {HnStoryAuthorModule} from '../story-author/hn-story-author.module';
import {HnStoryAuthorService} from '../story-author/hn-story-author.service';
import {HnStoryAuthorInviteModule} from '../story-author-invite/hn-story-author-invite.module';
import {HnStoryAuthorInviteService} from '../story-author-invite/hn-story-author-invite.service';
import {HnCoreModule} from '../core/hn-core.module';
import {HnFileStoryService} from '../file-aggregate/file-story/hn-file-story.service';
import {HnFileStoryModule} from '../file-aggregate/file-story/hn-file-story.module';
import {HnStoryFileModule} from '../story-file/hn-story-file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnStory]),

    HnCoreModule,
    HnTopicModule,
    HnStoryAuthorModule,
    HnUserModule,
    HnStoryAuthorInviteModule,
    HnFileStoryModule,
    HnStoryFileModule
  ],
  exports: [
    TypeOrmModule,
    HnStoryService
  ],
  controllers: [
    HnStoryController
  ],
  providers: [
    HnStoryService,
    HnTopicService,
    HnStoryAuthorService,
    HnStoryAuthorInviteService,
    HnFileStoryService
  ],
})
export class HnStoryModule {
}
