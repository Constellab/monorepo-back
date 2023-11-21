import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnSpaceLiveTask} from './hn-space-live-task.entity';
import {HnSpaceLiveTaskService} from './hn-space-live-task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnSpaceLiveTask])
  ],
  exports: [TypeOrmModule, HnSpaceLiveTaskService],
  providers: [HnSpaceLiveTaskService]
})
export class HnSpaceLiveTaskModule {

}
