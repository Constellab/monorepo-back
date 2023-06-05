import {Injectable, Logger} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabServerService} from './server/cn-lab-server.service';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnLabGreenOptionService} from './green-option/cn-lab-green-option.service';
import {
  CnLabGreenOption,
  CnLabGreenOptionStopAfterInactivityValue,
  CnLabGreenOptionStopAfterTimeValue,
  CnLabGreenOptionType
} from './green-option/cn-lab-green-option.entity';
import {CnExternalLabManagerApiService} from '../cn-external-lab-api/cn-external-lab-manager-api.service';
import {CnExternalLabApiService} from '../cn-external-lab-api/cn-external-lab-api.service';
import {ClDateHelper} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {CnLabInstance} from './cn-lab-instance.entity';

/**
 * Service that gather all the cron jobs for the lab instances
 */
@Injectable()
export class CnLabInstancesCron {

  private readonly logger = new Logger(CnLabInstancesCron.name);

  constructor(private labServerService: CnLabServerService,
              private labInstanceService: CnLabInstancesService,
              private userService: CnUsersService,
              private labRuleService: CnLabGreenOptionService,
              private labManagerService: CnExternalLabManagerApiService,
              private externalLabApiService: CnExternalLabApiService) {
  }

  /**
   * Refresh the status of the lab instances and stop waiting lab instances
   */
  // '0 */10 * * * *' = every 10 minutes
  @Cron('0 */10 * * * *')
  async refreshLabInstanceStatus(): Promise<void> {
    this.logger.debug('[Cron] Start of refresh lab instance status')
    await this.setRobotUserInContext();

    await this.refreshLabTempStatus();
    await this.checkStopAfterBackup();
    await this.checkStopAfterExperiment();
    await this.checkStopAfterTime();
    await this.checkStopAfterInactivity();

    this.cleanRobotUserInContext();
    this.logger.debug('[Cron] End of refresh lab instance status')
  }

  private async refreshLabTempStatus(): Promise<void> {
    const labInstances = await this.labInstanceService.getLabInstancesWithTempStatus();

    for (const labInstance of labInstances) {
      await this.labServerService.refreshLabStatus(labInstance.id).catch();
    }
  }

  private async checkStopAfterBackup(): Promise<void> {
    const rules = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_BACKUP);

    for (const rule of rules) {
      const lab = rule.labInstance;
      if (lab.isRunning()) {
        const backup = await this.labManagerService.getLastBackupStatus(lab.getLabManagerApiInfo()).catch(() => null);

        // if the backup is in progress, we do nothing
        if (backup == null || backup.status === 'IN_PROGRESS') {
          continue;
        }

        await this.stopLab(lab, rule);
      }
    }
  }

  private async checkStopAfterExperiment(): Promise<void> {
    const rules = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_EXPERIMENT);

    for (const rule of rules) {
      const lab = rule.labInstance;
      if (lab.isRunning()) {
        const labGlobalActivity = await this.externalLabApiService.getLabGlobalActivity(lab.getGlabApiInfo()).catch(() => null);

        if (labGlobalActivity == null || labGlobalActivity.running_experiments > 0 || labGlobalActivity.queued_experiments > 0) {
          continue;
        }

        await this.stopLab(lab, rule);
      }
    }
  }

  private async checkStopAfterTime(): Promise<void> {
    const rules = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_TIME);

    for (const rule of rules) {
      const lab = rule.labInstance;
      if (!lab.isRunning()) {
        const value: CnLabGreenOptionStopAfterTimeValue = rule.value as CnLabGreenOptionStopAfterTimeValue;

        // get the current date in the rule timezone
        const today = DateTime.local({zone: value.timezone});
        // if (!value.days.includes(today.weekday)) continue;

        // Get the same day date with time from the rule
        const ruleDate = DateTime.local({zone: value.timezone}).set({hour: value.hours, minute: value.minutes});

        // check if current time is after stop time
        if (today < ruleDate) continue;

        await this.stopLab(lab, rule, `hour ${value.hours} minute ${value.minutes}`);
      }
    }
  }

  private async checkStopAfterInactivity(): Promise<void> {
    const rules = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_INACTIVITY_TIME);

    for (const rule of rules) {
      const lab = rule.labInstance;
      if (lab.isRunning()) {
        const value: CnLabGreenOptionStopAfterInactivityValue = rule.value as CnLabGreenOptionStopAfterInactivityValue;

        const labGlobalActivity = await this.externalLabApiService.getLabGlobalActivity(lab.getGlabApiInfo()).catch(() => null);
        if (labGlobalActivity.last_activity == null) continue;

        const lastActivityDate = ClDateHelper.getDate(labGlobalActivity.last_activity.created_at);

        // check if differences in minutes between last activity and now is greater than inactivity time
        if (lastActivityDate.diffNow('minutes').minutes < value.inactivityDuration) continue;

        await this.stopLab(lab, rule, `${value.inactivityDuration} minutes`);
      }
    }
  }

  private async stopLab(lab: CnLabInstance, rule: CnLabGreenOption, ruleDetail?: string): Promise<void> {
    this.logger.log(`[Cron] Stopping lab :${lab.id}, rule: ${rule.type} ${ruleDetail ? `(${ruleDetail})` : ''}`);
    await this.labServerService.stopLab(lab).then(async () => {
      await this.cleanRuleAfterExecution(rule);
    }).catch(err => {
      this.logger.error(`Error while stopping the lab : ${lab.id}, rule : ${rule.type}, error: ${err.message}`);
    });
  }

  private async cleanRuleAfterExecution(rule: CnLabGreenOption): Promise<void> {
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
