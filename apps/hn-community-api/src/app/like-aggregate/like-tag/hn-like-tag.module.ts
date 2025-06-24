import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnLikeTag } from './hn-like-tag.entity';
import { HnTagKeyModule } from '../../tag-aggregate/tag-key/hn-tag-key.module';
import { HnLikeTagService } from './hn-like-tag.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnLikeTag]), HnTagKeyModule],
  providers: [HnLikeTagService],
  exports: [TypeOrmModule, HnLikeTagService],
})
export class HnLikeTagModule {}
