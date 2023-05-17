import {Module} from '@nestjs/common';
import {HnStoryAuthorService} from './hn-story-author.service';
import {HnStoryAuthorController} from './hn-story-author.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnStoryAuthor} from './hn-story-author.entity';
import {HnUserModule} from '../users/hn-user.module';
import {HnStoryAuthorInviteService} from '../story-author-invite/hn-story-author-invite.service';
import {HnStoryAuthorInviteModule} from '../story-author-invite/hn-story-author-invite.module';
import {HnCoreModule} from '../core/hn-core.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnStoryAuthor]), HnCoreModule, HnUserModule, HnStoryAuthorInviteModule],
  exports: [TypeOrmModule],
  controllers: [HnStoryAuthorController],
  providers: [HnStoryAuthorService, HnStoryAuthorInviteService],
})
export class HnStoryAuthorModule {
}
