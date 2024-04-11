import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnLiveTaskCoAuthorInvite} from './hn-live-task-co-author-invite.entity';
import {HnLiveTaskCoAuthorInviteService} from './hn-live-task-co-author-invite.service';
import {HnUserModule} from '../../users/hn-user.module';
import {HnFrontService} from '../../core/service/hn-front.service';
import {HnCoreConfigModule} from '../../core/modules/core-config/hn-core-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnLiveTaskCoAuthorInvite]),
    HnUserModule,
    HnCoreConfigModule
  ],
  exports: [TypeOrmModule, HnLiveTaskCoAuthorInviteService],
  providers: [HnLiveTaskCoAuthorInviteService, HnFrontService]
})
export class HnLiveTaskCoAuthorInviteModule {
}
