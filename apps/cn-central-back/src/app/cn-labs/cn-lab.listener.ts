import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CnLabEvent, cnLabEventName, CnLabServerTaskStatusChangedEvent, CnLabStatusChangedEvent } from './cn-lab.event';
import { CnLabServerTaskStatus, CnLabStatus } from './status/cn-lab-status.enum';
import { CnLabManagerService } from './cn-lab-manager.service';
import { CnLabsService } from './cn-labs.service';
import { CnLabConfigsService } from '../cn-lab-configs/cn-lab-configs.service';
import { CnLabMailService } from './mail/cn-lab-mail.service';


@Injectable()
export class CnLabListener {

  private readonly logger = new Logger(CnLabListener.name);


  constructor(private labManagerService: CnLabManagerService,
              private labsService: CnLabsService,
              private labConfigService: CnLabConfigsService,
              private labMailService: CnLabMailService) {
  }

  @OnEvent(cnLabEventName)
  async handleLabEvent(event: CnLabEvent): Promise<void> {
    if (event.type === 'LAB_STATUS_CHANGED') {
      await this.handleLabStatusChanged(event);
    } else if (event.type === 'LAB_SERVER_TASK_STATUS_CHANGED') {
      await this.handleLabServerTaskStatusChanged(event);
    }
  }

  private async handleLabStatusChanged(event: CnLabStatusChangedEvent): Promise<void> {
    // if the lab server switched from a stopped state to a running state
    if (event.newStatus === CnLabStatus.SERVER_CONFIGURED &&
      [CnLabStatus.SERVER_STARTING, CnLabStatus.NO_SERVER,
        CnLabStatus.SERVER_STOPPED, CnLabStatus.SERVER_RUNNING].includes(event.oldStatus)) {
      await this.configureAndStartLabBricksAfterInit(event.labId).catch(
        // if an error occurred we just refresh the lab status
        (error: Error) => this.onError(event.labId, `Error during lab manager start : ${error.message}`)
      );
    }

    // email the user if this is the first time the lab is running
    if (event.newStatus === CnLabStatus.LAB_RUNNING) {
      const runningStatuses =
        await this.labsService.findByStatus(event.labId, CnLabStatus.LAB_RUNNING);

      if (runningStatuses.length === 1) {
        const lab = await this.labsService.findByIdAndCheck(event.labId);
        await this.labMailService.sendLabStartedMail(lab);
      }
    }
  }

  /**
   * Method called when the lab server task status has changed
   * @param event
   * @private
   */
  private async handleLabServerTaskStatusChanged(event: CnLabServerTaskStatusChangedEvent): Promise<void> {
    // email Constellab support is a lab has a problem on start
    if (event.newStatus === CnLabServerTaskStatus.ERROR) {
      const lab = await this.labsService.findByIdAndCheck(event.labId);
      await this.labMailService.sendLabStartErrorMail(lab);
    }
  }


  /**
   * Method called after the lab server has started to start the lab if the lab is configured
   * If the lab manager is not configured but the lab has a configuration, it updates the lab manager config
   * @private
   * @param id
   * @return {Promise<boolean>} true if the lab manager has been started
   */
  private async configureAndStartLabBricksAfterInit(id: string): Promise<boolean> {
    const lab = await this.labsService.findByIdAndCheck(id, {space: true});

    // wait for the lab manager to be ready
    await this.labManagerService.waitForHealthCheck(lab.getLabManagerApiInfo().apiUrl);

    const labManagerStatus = await this.labManagerService.getLabStatus(lab);

    // if there is already a running task, we do nothing
    if (labManagerStatus.currentTask?.status === CnLabServerTaskStatus.RUNNING) return false;

    // if the lab is already configured, we don't update its config
    const managerConfig = await this.labManagerService.getConfig(lab);
    if (managerConfig == null || managerConfig.brickVersions == null || managerConfig.brickVersions.length === 0) {

      // if the lab doesn't have a lab config, do nothing
      if (lab.labConfigId == null) return false;

      // get the lab bricks config
      const labConfig = await this.labConfigService.getCompleteConfig(lab.labConfigId);

      const configDto = labConfig.toLabConfigDTO();
      this.logger.log(`Configuring lab manager for lab ${id}`);
      await this.labManagerService.updateConfig(lab, configDto);
    }

    this.logger.log(`Init lab manager for lab ${id}`);
    await this.labManagerService.initAll(lab, lab.space.domain);

    return true;
  }

  private async onError(labId: string, message: string): Promise<void> {
    this.logger.error(message);
    await this.labsService.updateServerTask(labId, message, CnLabServerTaskStatus.ERROR)
      .catch(err => this.logger.error(err));
  }
}
