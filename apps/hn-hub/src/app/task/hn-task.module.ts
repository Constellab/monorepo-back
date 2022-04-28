import {Module} from '@nestjs/common';
import {HnTaskService} from './hn-task.service';
import {HnTaskController} from './hn-task.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnTask} from './hn-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HnTask])],
  controllers: [HnTaskController],
  exports: [TypeOrmModule],
  providers: [HnTaskService],
})
export class HnTaskModule {
}
