import {Module} from '@nestjs/common';
import {HnLiveTaskModule} from './live-task/hn-live-task.module';
import {HnLiveTaskVersionModule} from './live-task-version/hn-live-task-version.module';
import {HnLiveTaskController} from './hn-live-task.controller';
import {HnLiveTaskAggregateService} from './hn-live-task-aggregate.service';

@Module({
  imports: [
    HnLiveTaskModule,
    HnLiveTaskVersionModule
  ],
  controllers: [HnLiveTaskController],
  providers: [HnLiveTaskAggregateService],
  exports: [HnLiveTaskAggregateService]
})
export class HnLiveTaskAggregateModule {

}
