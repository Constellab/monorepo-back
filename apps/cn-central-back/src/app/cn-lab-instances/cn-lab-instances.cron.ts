import {Injectable, Logger} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabServerService} from './server/cn-lab-server.service';
import {CnLabGreenOptionService} from './green-option/cn-lab-green-option.service';
import {
  CnLabGreenOption,
  CnLabGreenOptionStopAfterInactivityValue,
  CnLabGreenOptionStopAfterTimeValue,
  CnLabGreenOptionType
} from './green-option/cn-lab-green-option.entity';
import {CnExternalLabApiService} from '../cn-external-lab-api/cn-external-lab-api.service';
import {ClDateHelper} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnLabInstanceAggregateService} from './cn-lab-instance-aggregate.service';
import {CnLabInstanceStatus} from './status/cn-lab-instance-status.enum';
import {CnLabFreeTrialService} from './free-trial/cn-lab-free-trial.service';
import {CnLabFreeTrial} from './free-trial/cn-lab-free-trial.entity';
import {CnLabBackupBucket} from './backup/cn-lab-backup.dto';
import {CnLabManagerService} from './cn-lab-manager.service';

/**
 * Service that gather all the cron jobs for the lab instances
 */
@Injectable()
export class CnLabInstancesCron {

  private readonly logger = new Logger(CnLabInstancesCron.name);

  constructor(private labServerService: CnLabServerService,
              private labInstanceService: CnLabInstancesService,
              private labRuleService: CnLabGreenOptionService,
              private labManagerService: CnLabManagerService,
              private externalLabApiService: CnExternalLabApiService,
              private labAggregateService: CnLabInstanceAggregateService,
              private freeTrialService: CnLabFreeTrialService) {
  }

  /**
   * Refresh temp the status of the lab instances every minute
   */
  @Cron('0 */1 * * * *')
  async refreshLabInstanceTempStatus(): Promise<void> {
    this.logger.debug('[Cron] Start of refresh lab instance temp status');

    await this.refreshLabTempStatus();

    this.logger.debug('[Cron] End of refresh lab instance temp status');
  }

  /**
   * Manager Green options to stop the lab instances
   */
  // '0 */10 * * * *' = every 10 minutes
  @Cron('0 */10 * * * *')
  async refreshLabInstanceStatus(): Promise<void> {
    this.logger.debug('[Cron] Start of refresh lab instance status');

    await this.checkStopAfterBackup();
    await this.checkStopAfterExperiment();
    await this.checkStopAfterTime();
    await this.checkStopAfterInactivity();

    this.logger.debug('[Cron] End of refresh lab instance status');

    this.logger.debug('[Cron] Start checking free trials labs');
    await this.checkFreeTrialLabs();
    await this.checkFreeTrialLabsToDelete();
    this.logger.debug('[Cron] ENd checking free trials labs');

  }

  private async refreshLabTempStatus(): Promise<void> {
    const labInstances = await this.labInstanceService.getLabInstancesWithTempStatus();

    for (const labInstance of labInstances) {

      // for status SERVER_RUNNING and SERVER_CONFIGURED, that are considered as half temp, we stop checking after 30 minutes
      if ([CnLabInstanceStatus.SERVER_RUNNING, CnLabInstanceStatus.SERVER_CONFIGURED].includes(labInstance.currentStatus.status)) {
        if (labInstance.currentStatus.createdAt.diffNow('minutes').minutes > 30) {
          continue;
        }
      }

      await this.labAggregateService.refreshLabStatus(labInstance.id).catch();
    }
  }

  private async checkStopAfterBackup(): Promise<void> {
    const options = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_BACKUP);

    for (const option of options) {
      const lab = await this.labInstanceService.findByIdAndCheck(option.labInstanceId);
      if (lab.isRunning()) {
        const backup: CnLabBackupBucket[] = await this.labManagerService.getLastBackupsStatus(lab).catch(() => null);

        // if a backup is in progress, we do nothing
        if (backup == null || backup.some(b => b.status === 'IN_PROGRESS')) {
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

  private async checkFreeTrialLabs(): Promise<void> {
    const runningFreeTrials = await this.freeTrialService.getRunningFreeTrias();

    for (const freeTrial of runningFreeTrials) {
      // if the lab is starting or stopping, we do nothing, it will be checked later
      if ([CnLabInstanceStatus.SERVER_STARTING, CnLabInstanceStatus.SERVER_STOPPING].includes(freeTrial.labInstance.currentStatus.status)) {
        continue;
      }

      // for each lab, check if the free trial is still valid
      const value = await this.freeTrialService.trialLabStillValid(freeTrial.labInstance.id);

      // is not, stop the lab
      if (!value) {
        this.logger.log(`[Cron] Stopping free trial lab :${freeTrial.labInstance.id}`);
        await this.labServerService.stopLab(freeTrial.labInstance);
      }
    }
  }

  private async checkFreeTrialLabsToDelete(): Promise<void> {
    const labsToDelete = await this.getFreeTrialsLabsToDelete();

    for (const lab of labsToDelete) {
      this.logger.log(`[Cron] Deleting free trial lab :${lab.labInstance.id}`);
      await this.labServerService.deleteLabInstanceServerAndVolume(lab.labInstance);
      await this.labAggregateService.refreshLabStatus(lab.labInstance.id);
    }
  }

  private async getFreeTrialsLabsToDelete(): Promise<CnLabFreeTrial[]> {
    const expiredLabs = await this.freeTrialService.getExpiredFreeTrials();

    return expiredLabs.filter(lab => lab.toDelete());
  }
}
