import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnTaskController } from './hn-task.controller';
import { HnTask } from './hn-task.entity';
import { HnTaskService } from './hn-task.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnTask])],
  controllers: [HnTaskController],
  exports: [TypeOrmModule],
  providers: [HnTaskService],
})
export class HnTaskModule {}
