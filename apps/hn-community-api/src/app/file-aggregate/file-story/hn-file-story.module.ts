import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../../core/hn-core.module';
import { HnFileStory } from './hn-file-story.entity';
import { HnFileStoryService } from './hn-file-story.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnFileStory]), HnCoreModule],
  exports: [TypeOrmModule],
  providers: [HnFileStoryService],
})
export class HnFileStoryModule {}
