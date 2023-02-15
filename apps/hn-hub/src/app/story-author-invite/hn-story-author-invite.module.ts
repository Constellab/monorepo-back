import {Module} from '@nestjs/common';
import {HnStoryAuthorInviteService} from './hn-story-author-invite.service';
import {HnStoryAuthorInviteController} from './hn-story-author-invite.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnStoryAuthorInvite} from './hn-story-author-invite.entity';
import {HnUserService} from '../users/hn-user.service';
import {HnUserModule} from '../users/hn-user.module';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnStoryAuthorInvite]), HnUserModule],
  exports: [TypeOrmModule],
  controllers: [HnStoryAuthorInviteController],
  providers: [HnStoryAuthorInviteService, HnUserService, HnCoreConfigService]
})
export class HnStoryAuthorInviteModule {
}
