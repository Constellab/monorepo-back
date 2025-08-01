import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnTagKeyModule } from '../../tag-aggregate/tag-key/hn-tag-key.module';
import { HnCommentTag } from './hn-comment-tag.entity';
import { HnCommentTagService } from './hn-comment-tag.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnCommentTag]), HnTagKeyModule],
  providers: [HnCommentTagService],
  exports: [TypeOrmModule, HnCommentTagService],
})
export class HnCommentTagModule {}
