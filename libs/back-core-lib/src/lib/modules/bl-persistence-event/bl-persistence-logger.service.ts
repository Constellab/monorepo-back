import {Injectable, Logger} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {BlUser} from '../../models/bl-user/bl-user.class';
import {BlPersistenceEvent, BlPersistenceEventService} from './bl-persistence-event.service';

@Injectable()
export class BlPersistenceLoggerService {

  private readonly logger = new Logger(BlPersistenceLoggerService.name);

  @OnEvent(BlPersistenceEventService.EVENT_PERSISTENCE)
  logPersistence(event: BlPersistenceEvent): void {
    this.logger.log(`[${event.action}] Object type : ${event.entityName} | Id : ${event.entityId} | User : ${this.getUserLog(event.user)}`);
  }

  private getUserLog(user: BlUser | null): string {
    if (user != null) {
      return 'User : ' + user.email;
    } else {
      return 'No user';
    }
  }

}
