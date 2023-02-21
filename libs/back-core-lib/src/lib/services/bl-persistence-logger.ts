import {AdvancedConsoleLogger, QueryRunner} from 'typeorm';
import {Logger} from '@nestjs/common';
import {BlUser} from '../models/bl-user.class';
import {BlCurrentUserHelper} from '../modules/bl-jwt/bl-current-user.helper';

export type BlPersistenceAction = 'INSERT' | 'UPDATE' | 'DELETE';

interface BlPersistenceLog {
  action: BlPersistenceAction;
  entityId: string;
  entityName: string;
}

/**
 * TypeORM logger
 * It is able to log the persistence on database when a commit is triggered
 */
export class BlPersistenceLogger extends AdvancedConsoleLogger {

  private static instance: BlPersistenceLogger;

  private readonly logger = new Logger(BlPersistenceLogger.name);

  // store the current transaction logs, those are printed only after a COMMIT
  // cleared if a ROLLBACK occurred
  private transactionLogs: BlPersistenceLog[] = [];

  private constructor() {
    super();
  }

  public static getInstance(): BlPersistenceLogger {
    if (!this.instance) {
      this.instance = new BlPersistenceLogger();
    }
    return this.instance;
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
    if (directLog) {
      this.writeLog(actionName, entityId, entityName);
      return;
    }

    // avoid duplicate logs
    if (this.transactionLogs.find(log => log.entityId === entityId && log.entityName === entityName
      && log.action === actionName) != null) {
      return;
    }
    this.transactionLogs.push({
      action: actionName,
      entityId: entityId,
      entityName: entityName
    });
  }

  private writeTransactionLogs(): void {
    for (const log of this.transactionLogs) {
      this.writeLog(log.action, log.entityId, log.entityName);
    }
  }

  private writeLog(actionName: BlPersistenceAction, entityId: string, entityName: string): void {
    this.logger.log(`[${actionName}] Object type : ${entityName} | Id : ${entityId} | ${this.getUserLog()}`);
  }


  private getUserLog(): string {
    const user: BlUser = BlCurrentUserHelper.getCurrentUser();
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
