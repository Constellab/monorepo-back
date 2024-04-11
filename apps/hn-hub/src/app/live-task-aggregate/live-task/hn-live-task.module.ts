import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnLiveTask} from './hn-live-task.entity';
import {HnLiveTaskService} from './hn-live-task.service';
import {HnLiveTaskCoAuthorModule} from '../live-task-co-author/hn-live-task-co-author.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnLiveTask]),
    HnLiveTaskCoAuthorModule
  ],
  exports: [TypeOrmModule, HnLiveTaskService],
  providers: [HnLiveTaskService]
})
export class HnLiveTaskModule {

}
