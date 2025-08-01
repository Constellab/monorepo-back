import { BlExternalApiModule } from '@monorepo/back-core-lib';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { HnAgentModule } from '../agent-aggregate/agent/hn-agent.module';
import { HnBrickModule } from '../brick-aggregate/brick/hn-brick.module';
import { HnBrickMajorVersionModule } from '../brick-aggregate/brick-major-version/hn-brick-major-version.module';
import { HnDocumentationModule } from '../brick-aggregate/documentation/hn-documentation.module';
import { HnCommentAppModule } from '../comment-aggregate/comment-app/hn-comment-app.module';
import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnStoryModule } from '../story/hn-story.module';
import { HnDifyController } from './hn-dify.controller';
import { HnDifyService } from './hn-dify.service';

@Module({
  imports: [
    HnCoreConfigModule,
    BlExternalApiModule,
    HnAgentModule,
    HnCommentAppModule,
    HnBrickModule,
    HnBrickMajorVersionModule,
    HnDocumentationModule,
    HnStoryModule,
    HttpModule,
  ],
  exports: [],
  controllers: [HnDifyController],
  providers: [HnDifyService, HnFrontService],
})
export class HnDifyModule {}
