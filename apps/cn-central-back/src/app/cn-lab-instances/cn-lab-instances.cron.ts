import {Injectable, Logger} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabServerService} from './server/cn-lab-server.service';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnLabStatusRuleService} from './status-rule/cn-lab-status-rule.service';
import {
  CnLabStatusRule,
  CnLabStatusRuleAction, CnLabStatusRuleStopAfterInactivityValue,
  CnLabStatusRuleStopAfterTimeValue,
  CnLabStatusRuleType
} from './status-rule/cn-lab-status-rule.entity';
import {CnExternalLabManagerApiService} from '../cn-external-lab-api/cn-external-lab-manager-api.service';
import {CnExternalLabApiService} from '../cn-external-lab-api/cn-external-lab-api.service';
import {ClDateHelper} from '@monorepo/core-lib';

/**
 * Service that gather all the cron jobs for the lab instances
 */
@Injectable()
export class CnLabInstancesCron {

  private readonly logger = new Logger(CnLabInstancesCron.name);

  constructor(private labServerService: CnLabServerService,
              private labInstanceService: CnLabInstancesService,
              private userService: CnUsersService,
              private labRuleService: CnLabStatusRuleService,
              private labManagerService: CnExternalLabManagerApiService,
              private externalLabApiService: CnExternalLabApiService) {
  }

  /**
   * Refresh the status of the lab instances and stop waiting lab instances
   */
  // '0 */10 * * * *' = every 10 minutes
  @Cron('0 */10 * * * *')
  async refreshLabInstanceStatus(): Promise<void> {
    this.logger.log('[Cron] Start refreshing the status of the lab instances...');

    await this.setRobotUserInContext();

    await this.refreshLabTempStatus();
    await this.checkStopAfterBackup();
    await this.checkStopAfterExperiment();
    await this.checkStopAfterTime();
    await this.checkStopAfterInactivity();

    this.cleanRobotUserInContext();
    this.logger.log('[Cron] End refreshing the status of the lab instances...');
  }

  private async refreshLabTempStatus(): Promise<void> {
    const labInstances = await this.labInstanceService.getLabInstancesWithTempStatus();

    for (const labInstance of labInstances) {
      await this.labServerService.refreshLabStatus(labInstance.id).catch();
    }
  }

  private async checkStopAfterBackup(): Promise<void> {
    const rules = await this.labRuleService.findRulesByActionAndType(
      CnLabStatusRuleAction.STOP_LAB,
      CnLabStatusRuleType.STOP_AFTER_BACKUP);

    for (const rule of rules) {
      const lab = rule.labInstance;
      if (lab.isRunning()) {
        const backup = await this.labManagerService.getLastBackupStatus(lab.getLabManagerApiInfo()).catch(() => null);

        // if the backup is in progress, we do nothing
        if (backup == null || backup.status === 'IN_PROGRESS') {
          continue;
        }


        this.logger.log(`[Cron] Stopping the lab ${lab.id} after backup...`);
        // if the backup is finished, we stop the lab
        await this.labServerService.stopLab(lab).catch(err => {
          this.logger.error(`Error while stopping the lab ${lab.id} after backup: ${err.message}`);
        });

        await this.cleanRuleAfterExecution(rule);
      }
    }
  }

  private async checkStopAfterExperiment(): Promise<void> {
    const rules = await this.labRuleService.findRulesByActionAndType(
      CnLabStatusRuleAction.STOP_LAB,
      CnLabStatusRuleType.STOP_AFTER_EXPERIMENT);

    for (const rule of rules) {
      const lab = rule.labInstance;
      if (lab.isRunning()) {
        const labGlobalActivity = await this.externalLabApiService.getLabGlobalActivity(lab.getGlabApiInfo()).catch(() => null);

        if (labGlobalActivity == null || labGlobalActivity.running_experiments > 0 || labGlobalActivity.queued_experiments > 0) {
          continue;
        }

        this.logger.log(`[Cron] Stopping lab ${lab.id} after experiment`);
        // if the experiment is finished, we stop the lab
        await this.labServerService.stopLab(lab).catch(err => {
          this.logger.error(`Error while stopping the lab ${lab.id} after experiment: ${err.message}`);
        });

        await this.cleanRuleAfterExecution(rule);
      }
    }
  }

  private async checkStopAfterTime(): Promise<void> {
    const rules = await this.labRuleService.findRulesByActionAndType(
      CnLabStatusRuleAction.STOP_LAB,
      CnLabStatusRuleType.STOP_AFTER_TIME);

    for (const rule of rules) {
      const lab = rule.labInstance;
      if (lab.isRunning()) {
        const value: CnLabStatusRuleStopAfterTimeValue = rule.value as CnLabStatusRuleStopAfterTimeValue;

        // check if today is active day in rule
        const today = ClDateHelper.getDate();
        if (!value.days.includes(today.weekday)) continue;

        // build the date of the rule for today
        const ruleDate = ClDateHelper.getDate().set({hour: value.hours, minute: value.minutes});

        // check if current time is after stop time
        if(today < ruleDate) continue;

        this.logger.log(`[Cron] Stopping lab ${lab.id} after time hour ${value.hours} minute ${value.minutes}`);
        // if the experiment is finished, we stop the lab
        await this.labServerService.stopLab(lab).catch(err => {
          this.logger.error(`Error while stopping the lab ${lab.id} after time: ${err.message}`);
        });

        await this.cleanRuleAfterExecution(rule);
      }
    }
  }

  private async checkStopAfterInactivity(): Promise<void> {
    const rules = await this.labRuleService.findRulesByActionAndType(
      CnLabStatusRuleAction.STOP_LAB,
      CnLabStatusRuleType.STOP_AFTER_INACTIVITY_TIME);

    for (const rule of rules) {
      const lab = rule.labInstance;
      if (lab.isRunning()) {
        const value: CnLabStatusRuleStopAfterInactivityValue = rule.value as CnLabStatusRuleStopAfterInactivityValue;

        // check if today is active day in rule
        const today = ClDateHelper.getDate();
        if (!value.days.includes(today.weekday)) continue;

        const labGlobalActivity = await this.externalLabApiService.getLabGlobalActivity(lab.getGlabApiInfo()).catch(() => null);
        if(labGlobalActivity.last_activity == null) continue;

        const lastActivityDate = ClDateHelper.getDate(labGlobalActivity.last_activity.created_at);

        // check if differences in minutes between last activity and now is greater than inactivity time
        if(lastActivityDate.diffNow('minutes').minutes < value.inactivityTime) continue;

        this.logger.log(`[Cron] Stopping lab ${lab.id} after time inactivity ${value.inactivityTime} minutes`);
        // if the experiment is finished, we stop the lab
        await this.labServerService.stopLab(lab).catch(err => {
          this.logger.error(`Error while stopping the lab ${lab.id} after inactivity: ${err.message}`);
        });

        await this.cleanRuleAfterExecution(rule);
      }
    }
  }

  private async cleanRuleAfterExecution(rule: CnLabStatusRule): Promise<void> {
    if (!rule.isPersistent) {
      await this.labRuleService.deleteById(rule.id);
    }
  }


  private async setRobotUserInContext(): Promise<void> {
    const robotUser = await this.userService.getRobotUser();
    CnCurrentUserHelper.setManualUser(robotUser);
  }

  private cleanRobotUserInContext(): void {
    CnCurrentUserHelper.cleanManualUser();
  }
}
