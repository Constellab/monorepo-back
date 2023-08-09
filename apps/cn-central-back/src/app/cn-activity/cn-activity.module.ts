import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnActivity} from './cn-activity.entity';
import {CnActivityController} from './cn-activity.controller';
import {CnActivityService} from './cn-activity.service';
import {EventEmitterModule} from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnActivity
    ]),

    EventEmitterModule,
  ],
  controllers: [CnActivityController],
  providers: [CnActivityService],
  exports: [CnActivityService]
})
export class CnActivityModule {
}
