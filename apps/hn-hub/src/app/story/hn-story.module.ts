import { Module } from '@nestjs/common';
import { HnStoryService } from './hn-story.service';
import { HnStoryController } from './hn-story.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnStory} from './hn-story.entity';
import {HnTopicService} from '../topic/hn-topic.service';
import {HnTopicModule} from '../topic/hn-topic.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnStory]), HnTopicModule],
  exports: [TypeOrmModule],
  controllers: [HnStoryController],
  providers: [HnStoryService, HnTopicService],
})
export class HnStoryModule {}
