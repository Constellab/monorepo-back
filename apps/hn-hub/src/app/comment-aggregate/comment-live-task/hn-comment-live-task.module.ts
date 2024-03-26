import {Module} from '@nestjs/common';
import {HnCommentLiveTaskService} from './hn-comment-live-task.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnLiveTaskAggregateModule} from '../../live-task-aggregate/hn-live-task-aggregate.module';
import {HnCommentLiveTask} from './hn-comment-live-task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnCommentLiveTask]),
    HnLiveTaskAggregateModule
  ],
  providers: [HnCommentLiveTaskService],
  exports: [TypeOrmModule, HnCommentLiveTaskService]
})
export class HnCommentLiveTaskModule {
}
