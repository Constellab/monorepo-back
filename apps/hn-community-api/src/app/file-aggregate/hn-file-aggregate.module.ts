import { Module } from '@nestjs/common';
import { HnCoreModule } from '../core/hn-core.module';
import { HnFileAggregateService } from './hn-file-aggregate.service';
import { HnFileStoryModule } from './file-story/hn-file-story.module';
import { HnFileDocumentationModule } from './file-documentation/hn-file-documentation.module';

@Module({
  imports: [HnCoreModule, HnFileStoryModule, HnFileDocumentationModule],
  providers: [HnFileAggregateService],
  exports: [HnFileAggregateService],
})
export class HnFileAggregateModule {}
