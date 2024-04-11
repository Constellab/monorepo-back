import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnLiveTaskCoAuthor} from './hn-live-task-co-author.entity';
import {HnLiveTaskCoAuthorService} from './hn-live-task-co-author.service';
import {HnLiveTaskCoAuthorInviteModule} from '../live-task-co-author-invite/hn-live-task-co-author-invite.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnLiveTaskCoAuthor]),
    HnLiveTaskCoAuthorInviteModule],
  exports: [TypeOrmModule, HnLiveTaskCoAuthorService],
  providers: [HnLiveTaskCoAuthorService]
})
export class HnLiveTaskCoAuthorModule {
}
