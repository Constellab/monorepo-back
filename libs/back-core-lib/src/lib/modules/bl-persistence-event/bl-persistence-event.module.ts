import {Global, Module} from '@nestjs/common';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {BlPersistenceEventService} from './bl-persistence-event.service';
import {BlPersistenceLoggerService} from './bl-persistence-logger.service';


@Global()
@Module({
  imports: [EventEmitterModule],
  providers: [BlPersistenceEventService, BlPersistenceLoggerService],
  exports: [BlPersistenceEventService, BlPersistenceLoggerService]
})
export class BlPersistenceEventModule {
}
