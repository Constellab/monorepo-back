import {Module} from '@nestjs/common';
import {HnFileLiveTaskService} from './hn-file-live-task.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnCoreModule} from '../../core/hn-core.module';
import {HnFileLiveTask} from './hn-file-live-task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnFileLiveTask]),
    HnCoreModule
  ],
  exports: [
    TypeOrmModule,
    HnFileLiveTaskService
  ],
  providers: [
    HnFileLiveTaskService
  ],
})
export class HnFileLiveTaskModule {
}
