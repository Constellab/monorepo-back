import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCommunityAppCoAuthorInviteModule } from '../community-app-co-author-invite/hn-community-app-co-author-invite.module';
import { HnCommunityAppCoAuthor } from './hn-community-app-co-author.entity';
import { HnCommunityAppCoAuthorService } from './hn-community-app-co-author.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnCommunityAppCoAuthor]), HnCommunityAppCoAuthorInviteModule],
  exports: [TypeOrmModule, HnCommunityAppCoAuthorService],
  providers: [HnCommunityAppCoAuthorService],
})
export class HnCommunityAppCoAuthorModule {}
