import {Injectable, Logger} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabServerService} from './server/cn-lab-server.service';
import {CnUsersService} from '../cn-users/cn-users.service';
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
    this.logger.debug('[Cron] Start of refresh lab instance status');

    await this.refreshLabTempStatus();
    await this.checkStopAfterBackup();
    await this.checkStopAfterExperiment();
    await this.checkStopAfterTime();
    await this.checkStopAfterInactivity();

    this.logger.debug('[Cron] End of refresh lab instance status');
  }

  private async refreshLabTempStatus(): Promise<void> {
    const labInstances = await this.labInstanceService.getLabInstancesWithTempStatus();

    for (const labInstance of labInstances) {
      await this.labServerService.refreshLabStatus(labInstance.id).catch();
    }
  }

  private async checkStopAfterBackup(): Promise<void> {
    const options = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_BACKUP);

    for (const option of options) {
      const lab = await this.labInstanceService.findByIdAndCheck(option.labInstanceId);
      if (lab.isRunning()) {
        const backup = await this.labManagerService.getLastBackupStatus(lab.getLabManagerApiInfo()).catch(() => null);

        // if the backup is in progress, we do nothing
        if (backup == null || backup.status === 'IN_PROGRESS') {
          continue;
        }

        await this.stopLab(lab, option);
      }
    }
  }

  private async checkStopAfterExperiment(): Promise<void> {
    const options = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_EXPERIMENT);

    for (const option of options) {
      const lab = await this.labInstanceService.findByIdAndCheck(option.labInstanceId);
      if (lab.isRunning()) {
        const labGlobalActivity = await this.externalLabApiService.getLabGlobalActivity(lab.getGlabApiInfo()).catch(() => null);

        if (labGlobalActivity == null || labGlobalActivity.running_experiments > 0 || labGlobalActivity.queued_experiments > 0) {
          continue;
        }

        await this.stopLab(lab, option);
      }
    }
  }

  private async checkStopAfterTime(): Promise<void> {
    const options = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_TIME);

    for (const option of options) {
      const lab = await this.labInstanceService.findByIdAndCheck(option.labInstanceId);
      if (lab.isRunning()) {
        const value: CnLabGreenOptionStopAfterTimeValue = option.value as CnLabGreenOptionStopAfterTimeValue;

        // get the current date in the option timezone
        const today = DateTime.local({zone: value.timezone});
        // if (!value.days.includes(today.weekday)) continue;

        // Get the same day date with time from the option
        const ruleDate = DateTime.local({zone: value.timezone}).set({hour: value.hours, minute: value.minutes});

        // check if current time is after stop time
        if (today < ruleDate) continue;

        await this.stopLab(lab, option, `hour ${value.hours} minute ${value.minutes} (${value.timezone})`);
      }
    }
  }

  private async checkStopAfterInactivity(): Promise<void> {
    const options = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_INACTIVITY_TIME);

    for (const option of options) {
      const lab = await this.labInstanceService.findByIdAndCheck(option.labInstanceId);
      if (lab.isRunning()) {
        const value: CnLabGreenOptionStopAfterInactivityValue = option.value as CnLabGreenOptionStopAfterInactivityValue;

        const labGlobalActivity = await this.externalLabApiService.getLabGlobalActivity(lab.getGlabApiInfo()).catch(() => null);
        if (labGlobalActivity.last_activity == null) continue;

        const lastActivityDate = ClDateHelper.getDate(labGlobalActivity.last_activity.created_at);

        // check if differences in minutes between last activity and now is greater than inactivity time
        // diffNow is negative if last activity is in the past
        if ((lastActivityDate.diffNow('minutes').minutes * -1) < value.inactivityDuration) continue;

        await this.stopLab(lab, option, `${value.inactivityDuration} minutes`);
      }
    }
  }

  private async stopLab(lab: CnLabInstance, option: CnLabGreenOption, ruleDetail?: string): Promise<void> {
    // check if there are running experiments
    await this.labServerService.checkLabActivity(lab).catch(() => null);
    this.logger.log(`[Cron] Stopping lab :${lab.id}, option: ${option.type} ${ruleDetail ? `(${ruleDetail})` : ''}`);
    await this.labServerService.stopLab(lab).then(async () => {
      await this.cleanRuleAfterExecution(option);
    }).catch(err => {
      this.logger.error(`Error while stopping the lab : ${lab.id}, option : ${option.type}, error: ${err.message}`);
    });
  }

  private async cleanRuleAfterExecution(option: CnLabGreenOption): Promise<void> {
    if (!option.isPersistent) {
      await this.labRuleService.deleteById(option.id);
    }
  }
}
