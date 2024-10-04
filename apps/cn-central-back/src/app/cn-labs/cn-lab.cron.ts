import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CnLabsService } from './cn-labs.service';
import { CnLabServerService } from './server/cn-lab-server.service';
import { CnLabGreenOptionService } from './green-option/cn-lab-green-option.service';
import {
  CnLabGreenOption,
  CnLabGreenOptionStopAfterInactivityValue,
  CnLabGreenOptionStopAfterTimeValue,
  CnLabGreenOptionType
} from './green-option/cn-lab-green-option.entity';
import { CnExternalLabApiService } from '../cn-external-lab-api/cn-external-lab-api.service';
import { ClDateHelper } from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { CnLab } from './cn-lab.entity';
import { CnLabAggregateService } from './cn-lab-aggregate.service';
import { CnLabStatus } from './status/cn-lab-status.enum';
import { CnLabFreeService } from './lab-free/cn-lab-free.service';
import { CnLabFree } from './lab-free/cn-lab-free.entity';
import { CnLabBackupBucket } from './backup/cn-lab-backup.dto';
import { CnLabManagerService } from './cn-lab-manager.service';

/**
 * Service that gather all the cron jobs for the labs
 */
@Injectable()
export class CnLabCron {

  private readonly logger = new Logger(CnLabCron.name);

  constructor(private labServerService: CnLabServerService,
              private labService: CnLabsService,
              private labRuleService: CnLabGreenOptionService,
              private labManagerService: CnLabManagerService,
              private externalLabApiService: CnExternalLabApiService,
              private labAggregateService: CnLabAggregateService,
              private labFreeService: CnLabFreeService) {
  }

  /**
   * Refresh temp the status of the labs every minute
   */
  @Cron('0 */1 * * * *')
  async logAndRefreshLabTempStatus(): Promise<void> {
    this.logger.debug('[Cron] Start of refresh lab temp status');

    await this.refreshLabTempStatus();

    this.logger.debug('[Cron] End of refresh lab temp status');
  }

  /**
   * Manager Green options to stop the labs
   */
  // '0 */5 * * * *' = every 5 minutes
  @Cron('0 */5 * * * *')
  async refreshLabStatus(): Promise<void> {
    this.logger.debug('[Cron] Start of refresh lab status');

    await this.checkStopAfterBackup();
    await this.checkStopAfterScenario();
    await this.checkStopAfterTime();
    await this.checkStopAfterInactivity();

    this.logger.debug('[Cron] End of refresh lab status');

    this.logger.debug('[Cron] Start checking free labs');
    await this.checkFreeLabs();
    await this.checkFreeLabsToDelete();
    this.logger.debug('[Cron] End checking free labs');

  }

  private async refreshLabTempStatus(): Promise<void> {
    const labs = await this.labService.getLabsWithTempStatus();

    for (const lab of labs) {

      // for status SERVER_RUNNING and SERVER_CONFIGURED, that are considered as half temp, we stop checking after 30 minutes
      if ([CnLabStatus.SERVER_RUNNING, CnLabStatus.SERVER_CONFIGURED].includes(lab.currentStatus.status)) {
        if (lab.currentStatus.createdAt.diffNow('minutes').minutes > 30) {
          continue;
        }
      }

      await this.labAggregateService.refreshLabStatus(lab.id).catch(
        (error: Error) => this.logger.error(`Error during lab ${lab.id} status refresh : ${error.message}`)
      );
    }
  }

  private async checkStopAfterBackup(): Promise<void> {
    const options = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_BACKUP);

    for (const option of options) {
      const lab = await this.labService.findByIdAndCheck(option.labId);
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

  private async checkStopAfterScenario(): Promise<void> {
    const options = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_SCENARIO);

    for (const option of options) {
      const lab = await this.labService.findByIdAndCheck(option.labId);
      if (lab.isRunning()) {
        const labGlobalActivity = await this.externalLabApiService.getLabGlobalActivity(lab.getGlabSpaceApiInfo()).catch(() => null);

        if (labGlobalActivity == null || labGlobalActivity.running_scenarios > 0 || labGlobalActivity.queued_scenarios > 0) {
          continue;
        }

        await this.stopLab(lab, option);
      }
    }
  }

  private async checkStopAfterTime(): Promise<void> {
    const options = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_TIME);

    for (const option of options) {
      const lab = await this.labService.findByIdAndCheck(option.labId);
      if (lab.isRunning()) {
        const value: CnLabGreenOptionStopAfterTimeValue = option.value as CnLabGreenOptionStopAfterTimeValue;

        // get the current date in the option timezone
        const today = DateTime.local({ zone: value.timezone });
        // if (!value.days.includes(today.weekday)) continue;

        // Get the same day date with time from the option
        const ruleDate = DateTime.local({ zone: value.timezone }).set({ hour: value.hours, minute: value.minutes });

        // check if current time is after stop time
        if (today < ruleDate) continue;

        await this.stopLab(lab, option, `hour ${value.hours} minute ${value.minutes} (${value.timezone})`);
      }
    }
  }

  private async checkStopAfterInactivity(): Promise<void> {
    const options = await this.labRuleService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_INACTIVITY_TIME);

    for (const option of options) {
      const lab = await this.labService.findByIdAndCheck(option.labId);
      if (lab.isRunning()) {
        const value: CnLabGreenOptionStopAfterInactivityValue = option.value as CnLabGreenOptionStopAfterInactivityValue;

        const labGlobalActivity = await this.externalLabApiService.getLabGlobalActivity(lab.getGlabSpaceApiInfo()).catch(() => null);
        if (labGlobalActivity == null || labGlobalActivity.last_activity == null) continue;

        const lastActivityDate = ClDateHelper.getDate(labGlobalActivity.last_activity.created_at);

        // check if differences in minutes between last activity and now is greater than inactivity time
        // diffNow is negative if last activity is in the past
        if ((Math.abs(lastActivityDate.diffNow('minutes').minutes)) < value.inactivityDuration) continue;

        await this.stopLab(lab, option, `${value.inactivityDuration} minutes`);
      }
    }
  }

  private async stopLab(lab: CnLab, option: CnLabGreenOption, ruleDetail?: string): Promise<void> {
    // check if there are running scenarios
    const check = await this.labServerService.checkLabActivity(lab, true).then(() => true)
      .catch((error: Error) => {
        this.logger.debug(`Not stopping lab : ${lab.id}, option : ${option.type}, because error: ${error.message}`);
        return false;
      });
    if (!check) return;

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

  private async checkFreeLabs(): Promise<void> {
    const runningFreeLab = await this.labFreeService.getRunningFreeTrias();

    for (const labFree of runningFreeLab) {
      // if the lab is starting or stopping, we do nothing, it will be checked later
      if ([CnLabStatus.SERVER_STARTING, CnLabStatus.SERVER_STOPPING].includes(labFree.lab.currentStatus.status)) {
        continue;
      }

      // for each lab, check if the free lab is still valid
      const value = await this.labFreeService.freeLabStillValid(labFree.lab.id);

      // is not, stop the lab
      if (!value) {
        this.logger.log(`[Cron] Stopping free lab :${labFree.lab.id}`);
        await this.labServerService.stopLab(labFree.lab);
      }
    }
  }

  private async checkFreeLabsToDelete(): Promise<void> {
    const labsToDelete = await this.getFreeLabsToDelete();

    for (const lab of labsToDelete) {
      this.logger.log(`[Cron] Deleting free lab :${lab.lab.id}`);
      await this.labServerService.deleteLabServerAndVolume(lab.lab);
      await this.labAggregateService.refreshLabStatus(lab.lab.id);
    }
  }

  private async getFreeLabsToDelete(): Promise<CnLabFree[]> {
    const expiredLabs = await this.labFreeService.getExpiredFreeLab();

    return expiredLabs.filter(lab => lab.toDelete());
  }
}
