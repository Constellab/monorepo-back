import { Module } from '@nestjs/common';
import { HnFileStoryService } from './hn-file-story.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnFileStory } from './hn-file-story.entity';
import { HnCoreModule } from '../../core/hn-core.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnFileStory]), HnCoreModule],
  exports: [TypeOrmModule],
  providers: [HnFileStoryService],
})
export class HnFileStoryModule {}
