import { Module } from '@nestjs/common';
import { HnStoryService } from './hn-story.service';
import { HnStoryController } from './hn-story.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnStory} from './hn-story.entity';
import {HnLabelService} from '../label/hn-label.service';
import {HnLabelModule} from '../label/hn-label.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnStory]), HnLabelModule],
  exports: [TypeOrmModule],
  controllers: [HnStoryController],
  providers: [HnStoryService, HnLabelService],
})
export class HnStoryModule {}
