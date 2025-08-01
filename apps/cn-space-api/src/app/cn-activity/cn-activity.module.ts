import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnActivity } from './cn-activity.entity';
import { CnActivityService } from './cn-activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnActivity]), EventEmitterModule],
  providers: [CnActivityService],
  exports: [CnActivityService],
})
export class CnActivityModule {}
