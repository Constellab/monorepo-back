import {AdvancedConsoleLogger, QueryRunner} from 'typeorm';
import {Logger} from '@nestjs/common';
import {User} from '../../../users/user.entity';
import {RequestContextHelper} from '../../modules/request-context/request-context.helper';

export type PersistenceAction = 'INSERT' | 'UPDATE' | 'DELETE';

interface PersistenceLog {
  action: PersistenceAction;
  entityId: string;
  entityName: string;
}

/**
 * TypeORM logger
 * It is able to log the persistence on database when a commit is triggered
 */
export class PersistenceLogger extends AdvancedConsoleLogger {

  private static instance: PersistenceLogger;

  private readonly logger = new Logger(PersistenceLogger.name);

  // store the current transaction logs, those are printed only after a COMMIT
  // cleared if a ROLLBACK occurred
  private transactionLogs: PersistenceLog[] = [];

  private constructor() {
    super();
  }

  public static getInstance(): PersistenceLogger {
    if (!this.instance) {
      this.instance = new PersistenceLogger();
    }
    return this.instance;
  }


  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): void {

    // if this is a commit, write all persistence logs
    if (this.queryIsCommit(query)) {
      this.writeTransactionLogs();
      // if this is a rollback, clear persistence logs
    } else if (this.queryIsRollback(query)) {
      this.clearLogs();
    }

    super.logQuery(query, parameters, queryRunner);
  }

  // save the log to log it on commit
  logPersistence(actionName: PersistenceAction, entityId: string, entityName: string): void {
    this.transactionLogs.push({
      action: actionName,
      entityId: entityId,
      entityName: entityName
    });
  }

  private writeTransactionLogs(): void {
    for (const log of this.transactionLogs) {
      this.logger.log(`[${log.action}] Object type : ${log.entityName} | Id : ${log.entityId} | ${this.getUserLog()}`);
    }
  }


  private getUserLog(): string {
    const user: User = RequestContextHelper.getCurrentUser();
    if (user != null) {
      return 'User : ' + user.email;
    } else {
      return 'No user';
    }
  }


  private queryIsCommit(query: string): boolean {
    return query === 'COMMIT';
  }

  private queryIsRollback(query: string): boolean {
    return query === 'ROLLBACK';
  }

  private clearLogs(): void {
    this.transactionLogs = [];
  }

}
