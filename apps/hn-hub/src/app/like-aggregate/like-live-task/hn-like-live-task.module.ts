import {Module} from '@nestjs/common';
import {HnLikeLiveTaskService} from './hn-like-live-task.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnLikeLiveTask} from './hn-like-live-task.entity';
import {HnLiveTaskAggregateModule} from '../../live-task-aggregate/hn-live-task-aggregate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnLikeLiveTask]),
    HnLiveTaskAggregateModule
  ],
  providers: [HnLikeLiveTaskService],
  exports: [TypeOrmModule, HnLikeLiveTaskService]
})
export class HnLikeLiveTaskModule {
}
