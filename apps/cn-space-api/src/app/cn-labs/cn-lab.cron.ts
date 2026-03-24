import { ClDateHelper } from '@monorepo/core-lib';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DateTime } from 'luxon';

import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnExternalLabApiService } from '../cn-external-lab-api/cn-external-lab-api.service';
import { CnLabBackupsHistory, CnLabBackupStatus } from './backup/cn-lab-backup.dto';
import { CnLab } from './cn-lab.entity';
import { CnLabAggregateService } from './cn-lab-aggregate.service';
import { CnLabManagerService } from './cn-lab-manager.service';
import { CnLabsService } from './cn-labs.service';
import {
  CnLabGreenOption,
  CnLabGreenOptionStopAfterInactivityValue,
  CnLabGreenOptionStopAfterTimeValue,
  CnLabGreenOptionType,
} from './green-option/cn-lab-green-option.entity';
import { CnLabGreenOptionService } from './green-option/cn-lab-green-option.service';
import { CnLabFree } from './lab-free/cn-lab-free.entity';
import { CnLabFreeService } from './lab-free/cn-lab-free.service';
import { CnLabMailService } from './mail/cn-lab-mail.service';
import { CnLabServerService } from './server/cn-lab-server.service';
import { CnLabStatus } from './status/cn-lab-status.enum';

/** Type of temp status email sent */
type CnTempStatusMailType = 'abnormal' | 'lab-manager-busy' | 'stopping';

/** Record of sent temp status emails for a lab */
interface CnTempStatusMailRecord {
  lastSentAt: DateTime;
  mailType: CnTempStatusMailType;
}

/**
 * Service that gather all the cron jobs for the labs
 */
@Injectable()
export class CnLabCron {
  private readonly logger = new Logger(CnLabCron.name);

  // statuses that are considered as half temp
  // if there stay
  private readonly SERVER_HALF_TEMP_STATUSES = [CnLabStatus.SERVER_RUNNING, CnLabStatus.SERVER_CONFIGURED];

  // In-memory tracking of sent temp status emails per lab
  // Key: labId, Value: record of last sent email
  private readonly tempStatusMailSentMap = new Map<string, CnTempStatusMailRecord>();

  // Cooldown period before resending a temp status email (24 hours)
  private readonly TEMP_STATUS_MAIL_COOLDOWN_HOURS = 24;

  constructor(
    private labServerService: CnLabServerService,
    private labService: CnLabsService,
    private labGreenOptionService: CnLabGreenOptionService,
    private labManagerService: CnLabManagerService,
    private externalLabApiService: CnExternalLabApiService,
    private labAggregateService: CnLabAggregateService,
    private labFreeService: CnLabFreeService,
    private labMailService: CnLabMailService,
    private configService: CnCoreConfigService
  ) {}

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
    const labs = await this.labService.getCloudLabsWithTempStatus();

    const tempMaxDuration = this.configService.getStartedServerTempStatusMaxDurationMinutes();

    for (const lab of labs) {
      const minutesInTempStatus = Math.abs(lab.currentStatus.createdAt.diffNow('minutes').minutes);

      // If the status of the lab is temp for more than the max duration
      if (minutesInTempStatus > tempMaxDuration) {
        await this.handleLabTempStatusLimitReached(lab, tempMaxDuration);
        continue;
      }

      await this.labAggregateService
        .refreshLabStatus(lab.id)
        .catch((error: Error) =>
          this.logger.error(`Error during lab ${lab.id} status refresh : ${error.message}`, error.stack)
        );
    }
  }

  /**
   * Handles a lab that has been in temp status for too long.
   * Different behavior based on status:
   * - SERVER_STARTING/SERVER_STOPPING: Send abnormal status email
   * - SERVER_HALF_TEMP_STATUSES: Check lab manager and act accordingly
   */
  private async handleLabTempStatusLimitReached(lab: CnLab, tempMaxDuration: number): Promise<void> {
    const status = lab.currentStatus.status;

    // For SERVER_STARTING or SERVER_STOPPING, just send an email saying this is not normal
    if (status === CnLabStatus.SERVER_STARTING || status === CnLabStatus.SERVER_STOPPING) {
      await this.sendTempStatusMailIfAllowed(
        lab,
        'abnormal',
        `The lab has been in status ${status} for more than ${tempMaxDuration} minutes. ` +
          `This is abnormal and requires investigation.`
      );
      return;
    }

    // For half temp statuses (SERVER_RUNNING, SERVER_CONFIGURED), check lab manager
    if (this.SERVER_HALF_TEMP_STATUSES.includes(status)) {
      await this.handleHalfTempStatusLab(lab, tempMaxDuration);
    }
  }

  /**
   * Handles labs in half temp status (SERVER_RUNNING, SERVER_CONFIGURED).
   * Checks lab manager status and:
   * - If error: stop the lab
   * - If busy: send email
   * - If not busy: send email and stop
   */
  private async handleHalfTempStatusLab(lab: CnLab, tempMaxDuration: number): Promise<void> {
    const labManagerStatus = await this.labAggregateService
      .getLabManagerBusyStatus(lab)
      .catch((): null => null);

    // If lab manager is in error, stop the lab immediately
    if (!labManagerStatus) {
      await this.stopTempStatusLab(lab, tempMaxDuration, `Lab manager is in error state. Stopping the lab.`);
      return;
    }

    // If lab manager is busy/running, just send an email
    if (labManagerStatus.isBusy) {
      await this.sendTempStatusMailIfAllowed(
        lab,
        'lab-manager-busy',
        `The lab manager is currently busy. The lab will be stopped once the lab manager is not busy.`
      );
      return;
    }

    // Lab manager is not busy, send email and stop the lab
    await this.stopTempStatusLab(lab, tempMaxDuration, `The lab manager is not busy. Stopping the lab.`);
  }

  /**
   * Stops a lab that has been in half temp status for too long.
   * Always sends an email when stopping.
   */
  private async stopTempStatusLab(lab: CnLab, tempMaxDuration: number, message: string): Promise<void> {
    this.logger.warn(
      `Lab ${lab.id} is in status ${lab.currentStatus.status} for more than` +
        ` ${tempMaxDuration} minutes, stopping it`
    );

    // Always send email when stopping the lab
    await this.sendTempStatusMailIfAllowed(lab, 'stopping', message);

    this.labServerService
      .stopLab(lab)
      .catch((error) =>
        this.labService.markInstanceAsError(
          lab.id,
          `Error when stopping the lab after temp status limit reach: ${error}`
        )
      );
  }

  /**
   * Sends a temp status email if allowed by the cooldown period (24 hours).
   * The 'stopping' mail type bypasses the cooldown check.
   */
  private async sendTempStatusMailIfAllowed(
    lab: CnLab,
    mailType: CnTempStatusMailType,
    message: string
  ): Promise<void> {
    // 'stopping' mail type always sends (bypasses cooldown)
    if (mailType !== 'stopping') {
      const lastRecord = this.tempStatusMailSentMap.get(lab.id);
      if (lastRecord) {
        const hoursSinceLastMail = Math.abs(lastRecord.lastSentAt.diffNow('hours').hours);
        if (hoursSinceLastMail < this.TEMP_STATUS_MAIL_COOLDOWN_HOURS) {
          this.logger.debug(
            `Skipping temp status mail for lab ${lab.id}, last sent ${hoursSinceLastMail.toFixed(1)}h ago`
          );
          return;
        }
      }
    }

    await this.labMailService.sendLabTempStatusLimitReachedMail(lab, message).catch((error) => {
      this.logger.error(
        `Error sending lab temp status limit reached mail for lab ${lab.id}: ${error.message}`
      );
    });

    // Record the sent email (update even for 'stopping' to track it)
    this.tempStatusMailSentMap.set(lab.id, {
      lastSentAt: DateTime.now(),
      mailType,
    });
  }

  private async checkStopAfterBackup(): Promise<void> {
    const options = await this.labGreenOptionService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_BACKUP);

    for (const option of options) {
      const lab = await this.labService.findByIdAndCheck(option.labId);
      if (lab.isRunning()) {
        const backup: CnLabBackupsHistory | null = await this.labManagerService
          .getLastBackupsStatus(lab)
          .catch((): null => null);

        // if a backup is in progress, we do nothing
        if (backup == null || backup.backups.some((b) => b.status === CnLabBackupStatus.IN_PROGRESS)) {
          continue;
        }

        await this.stopLab(lab, option);
      }
    }
  }

  private async checkStopAfterScenario(): Promise<void> {
    const options = await this.labGreenOptionService.findRulesByType(
      CnLabGreenOptionType.STOP_AFTER_SCENARIO
    );

    for (const option of options) {
      const lab = await this.labService.findByIdAndCheck(option.labId);
      if (lab.isRunning()) {
        const labGlobalActivity = await this.externalLabApiService
          .getLabGlobalActivity(lab.getGlabSpaceApiInfo())
          .catch((): null => null);

        if (
          labGlobalActivity == null ||
          labGlobalActivity.running_scenarios > 0 ||
          labGlobalActivity.queued_scenarios > 0
        ) {
          continue;
        }

        await this.stopLab(lab, option);
      }
    }
  }

  private async checkStopAfterTime(): Promise<void> {
    const options = await this.labGreenOptionService.findRulesByType(CnLabGreenOptionType.STOP_AFTER_TIME);

    for (const option of options) {
      const lab = await this.labService.findByIdAndCheck(option.labId);
      if (lab.isRunning()) {
        const value: CnLabGreenOptionStopAfterTimeValue = option.value as CnLabGreenOptionStopAfterTimeValue;

        // get the current date in the option timezone
        const today = DateTime.local({ zone: value.timezone });
        // if (!value.days.includes(today.weekday)) continue;

        // Get the same day date with time from the option
        const ruleDate = DateTime.local({ zone: value.timezone }).set({
          hour: value.hours,
          minute: value.minutes,
        });

        // check if current time is after stop time
        if (today < ruleDate) continue;

        await this.stopLab(lab, option, `hour ${value.hours} minute ${value.minutes} (${value.timezone})`);
      }
    }
  }

  private async checkStopAfterInactivity(): Promise<void> {
    const options = await this.labGreenOptionService.findRulesByType(
      CnLabGreenOptionType.STOP_AFTER_INACTIVITY_TIME
    );

    for (const option of options) {
      const lab = await this.labService.findByIdAndCheck(option.labId);
      if (lab.isRunning()) {
        const value: CnLabGreenOptionStopAfterInactivityValue =
          option.value as CnLabGreenOptionStopAfterInactivityValue;

        const labGlobalActivity = await this.externalLabApiService
          .getLabGlobalActivity(lab.getGlabSpaceApiInfo())
          .catch((): null => null);
        if (labGlobalActivity == null || labGlobalActivity.last_activity == null) continue;

        const lastActivityDate = ClDateHelper.getDate(labGlobalActivity.last_activity.created_at);

        // check if differences in minutes between last activity and now is greater than inactivity time
        // diffNow is negative if last activity is in the past
        if (Math.abs(lastActivityDate.diffNow('minutes').minutes) < value.inactivityDuration) continue;

        await this.stopLab(lab, option, `${value.inactivityDuration} minutes`);
      }
    }
  }

  private async stopLab(lab: CnLab, option: CnLabGreenOption, ruleDetail?: string): Promise<void> {
    // check if there are running scenarios
    const check = await this.labServerService
      .checkLabActivity(lab, true)
      .then(() => true)
      .catch((error: Error) => {
        this.logger.debug(
          `Not stopping lab : ${lab.id}, option : ${option.type}, because error: ${error.message}`
        );
        return false;
      });
    if (!check) return;

    this.logger.log(
      `[Cron] Stopping lab :${lab.id}, option: ${option.type} ${ruleDetail ? `(${ruleDetail})` : ''}`
    );
    await this.labServerService.stopLab(lab).catch((err) => {
      this.logger.error(
        `Error while stopping the lab : ${lab.id}, option : ${option.type}, error: ${err.message}`
      );
    });
  }

  private async checkFreeLabs(): Promise<void> {
    const runningFreeLab = await this.labFreeService.getRunningFreeTrias();

    for (const labFree of runningFreeLab) {
      // if the lab is starting or stopping, we do nothing, it will be checked later
      if (
        [CnLabStatus.SERVER_STARTING, CnLabStatus.SERVER_STOPPING].includes(labFree.lab.currentStatus.status)
      ) {
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
      await this.labAggregateService.deleteServerInstanceNotSecure(lab.lab);
    }
  }

  private async getFreeLabsToDelete(): Promise<CnLabFree[]> {
    const expiredLabs = await this.labFreeService.getExpiredFreeLab();

    return expiredLabs.filter((lab) => lab.toDelete());
  }
}
