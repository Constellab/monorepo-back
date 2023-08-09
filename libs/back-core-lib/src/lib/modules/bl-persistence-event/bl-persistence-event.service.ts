import {Injectable} from '@nestjs/common';
import {AdvancedConsoleLogger, QueryRunner} from 'typeorm';
import {BlUser} from '../../models/bl-user/bl-user.class';
import {BlCurrentUserHelper} from '../bl-jwt/bl-current-user.helper';
import {EventEmitter2} from '@nestjs/event-emitter';

export type BlPersistenceAction = 'INSERT' | 'UPDATE' | 'DELETE';

export interface BlPersistenceEvent {
  action: BlPersistenceAction;
  entityId: string;
  entityName: string;
  user: BlUser | null;
}

@Injectable()
export class BlPersistenceEventService extends AdvancedConsoleLogger {

  public static readonly EVENT_PERSISTENCE = 'persistence';


  // store the current transaction logs, those are printed only after a COMMIT
  // cleared if a ROLLBACK occurred
  private transactionEvents: BlPersistenceEvent[] = [];

  constructor(private eventEmitter: EventEmitter2) {
    super();
  }


  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): void {

    // if this is a commit, write all persistence logs
    if (this.queryIsCommit(query)) {
      this.writeTransactionLogs();
      this.clearLogs();
      // if this is a rollback, clear persistence logs
    } else if (this.queryIsRollback(query)) {
      this.clearLogs();
    }

    super.logQuery(query, parameters, queryRunner);
  }

  // save the log to log it on commit
  logPersistence(actionName: BlPersistenceAction, entityId: string, entityName: string, directLog: boolean): void {
    const event: BlPersistenceEvent = {
      action: actionName,
      entityId: entityId,
      entityName: entityName,
      user: BlCurrentUserHelper.getCurrentUser()
    };
    if (directLog) {
      this.emitEvent(event);
      return;
    }

    // avoid duplicate logs
    if (this.transactionEvents.find(log => log.entityId === entityId && log.entityName === entityName
      && log.action === actionName) != null) {
      return;
    }
    this.transactionEvents.push({
      action: actionName,
      entityId: entityId,
      entityName: entityName,
      user: BlCurrentUserHelper.getCurrentUser()
    });
  }

  private writeTransactionLogs(): void {
    for (const log of this.transactionEvents) {
      this.emitEvent(log);
    }
  }

  private emitEvent(event: BlPersistenceEvent): void {
    this.eventEmitter.emit(BlPersistenceEventService.EVENT_PERSISTENCE, event);
  }

  private queryIsCommit(query: string): boolean {
    return query === 'COMMIT';
  }

  private queryIsRollback(query: string): boolean {
    return query === 'ROLLBACK';
  }

  private clearLogs(): void {
    this.transactionEvents = [];
  }
}
