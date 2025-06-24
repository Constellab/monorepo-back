import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnCommentTag } from './hn-comment-tag.entity';
import { HnTagKeyModule } from '../../tag-aggregate/tag-key/hn-tag-key.module';
import { HnCommentTagService } from './hn-comment-tag.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnCommentTag]), HnTagKeyModule],
  providers: [HnCommentTagService],
  exports: [TypeOrmModule, HnCommentTagService],
})
export class HnCommentTagModule {}
