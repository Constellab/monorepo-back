import {Injectable, Logger} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {cnLabInstanceEventName, CnLabInstanceStatusChangedEvent} from './cn-lab-instance.event';
import {CnLabInstanceServerTaskStatus, CnLabInstanceStatus} from './status/cn-lab-instance-status.enum';
import {CnLabManagerService} from './cn-lab-manager.service';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabConfigsService} from '../cn-lab-configs/cn-lab-configs.service';


@Injectable()
export class CnLabListener {

  private readonly logger = new Logger(CnLabListener.name);


  constructor(private labManagerService: CnLabManagerService,
              private labInstancesService: CnLabInstancesService,
              private labConfigService: CnLabConfigsService) {
  }

  @OnEvent(cnLabInstanceEventName)
  async handleLabInstanceEvent(event: CnLabInstanceStatusChangedEvent): Promise<void> {
    if (event.type === 'LAB_STATUS_CHANGED') {
      // if the lab server switched from a stopped state to a running state
      if (event.newStatus === CnLabInstanceStatus.SERVER_CONFIGURED &&
        [CnLabInstanceStatus.SERVER_STARTING, CnLabInstanceStatus.NO_SERVER,
          CnLabInstanceStatus.SERVER_STOPPED, CnLabInstanceStatus.SERVER_RUNNING].includes(event.oldStatus)) {
        await this.configureAndStartLabBricksAfterInit(event.labInstanceId).catch(
          // if an error occurred we just refresh the lab status
          (error: Error) => this.onError(event.labInstanceId, `Error during lab manager start : ${error.message}`)
        );
      }
    }
  }


  /**
   * Method called after the lab server has started to start the lab if the lab is configured
   * If the lab manager is not configured but the lab has a configuration, it updates the lab manager config
   * @private
   */
  private async configureAndStartLabBricksAfterInit(id: string): Promise<void> {
    const labInstance = await this.labInstancesService.findByIdAndCheck(id, {space: true});

    // wait for the lab manager to be ready
    await this.labManagerService.waitForHealthCheck(labInstance.getLabManagerApiInfo().apiUrl);

    // if the lab is already configured, we don't update its config
    const managerConfig = await this.labManagerService.getConfig(labInstance);
    if (managerConfig == null || managerConfig.brickVersions == null || managerConfig.brickVersions.length === 0) {

      // if the lab doesn't have a lab config, do nothing
      if (labInstance.labConfigId == null) return;

      // get the lab bricks config
      const labConfig = await this.labConfigService.getCompleteConfig(labInstance.labConfigId);

      const configDto = labConfig.toLabInstanceConfigDTO();
      this.logger.log(`Configuring lab manager for lab instance ${id}`);
      await this.labManagerService.updateConfig(labInstance, configDto);
    }

    this.logger.log(`Init lab manager for lab instance ${id}`);
    await this.labManagerService.initAll(labInstance, labInstance.space.domain);

  }

  private async onError(labInstanceId: string, message: string): Promise<void> {
    this.logger.error(message);
    await this.labInstancesService.updateServerTask(labInstanceId, message, CnLabInstanceServerTaskStatus.ERROR)
      .catch(err => this.logger.error(err));
  }
}
