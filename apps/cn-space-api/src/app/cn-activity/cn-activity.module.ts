import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnActivity } from './cn-activity.entity';
import { CnActivityService } from './cn-activity.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [TypeOrmModule.forFeature([CnActivity]), EventEmitterModule],
  providers: [CnActivityService],
  exports: [CnActivityService],
})
export class CnActivityModule {}
