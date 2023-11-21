import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnLiveTask} from './hn-live-task.entity';
import {HnLiveTaskService} from './hn-live-task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnLiveTask])
  ],
  exports: [TypeOrmModule, HnLiveTaskService],
  providers: [HnLiveTaskService]
})
export class HnLiveTaskModule {

}
