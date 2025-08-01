import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnTagCoAuthorInviteModule } from '../tag-co-author-invite/hn-tag-co-author-invite.module';
import { HnTagCoAuthor } from './hn-tag-co-author.entity';
import { HnTagCoAuthorService } from './hn-tag-co-author.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnTagCoAuthor]), HnTagCoAuthorInviteModule],
  exports: [TypeOrmModule, HnTagCoAuthorService],
  providers: [HnTagCoAuthorService],
})
export class HnTagCoAuthorModule {}
