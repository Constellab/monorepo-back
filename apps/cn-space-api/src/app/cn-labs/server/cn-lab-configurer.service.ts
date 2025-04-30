import { Injectable, Logger } from '@nestjs/common';
import { CnLab } from '../cn-lab.entity';
import { CnExecCommandMode } from '../../cn-core/services/cn-command.service';
import { CnLabsService } from '../cn-labs.service';
import { CnCoreConfigService } from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnLabManagerService } from '../cn-lab-manager.service';
import { CnLabSshService } from './cn-lab-ssh.service';
import { CnCloudProviderFactory } from './cn-cloud-provider.factory';
import { CnLabServerTaskStatus } from '../status/cn-lab-status.enum';
import { BlBadRequestException } from '@monorepo/back-core-lib';

/**
 * Service to configure the lab server.
 * Almost same configuration for all servers (all cloud providers)
 */
@Injectable()
export class CnLabConfigurerService {
  private readonly logger = new Logger(CnLabConfigurerService.name);

  constructor(
    private labService: CnLabsService,
    private coreConfigService: CnCoreConfigService,
    private labManagerService: CnLabManagerService,
    private cloudProviderFactory: CnCloudProviderFactory
  ) {}

  public async configureServer(lab: CnLab): Promise<CnLab> {
    try {
      const sshService = await this.cloudProviderFactory.getSshLabService(lab);

      // get lab configurer repository
      await this.refreshLabConfigurerRepo(sshService, lab.id);

      // mount volume
      await this.mountVolume(lab);

      // Execute prepare_server.sh
      await this.callPrepareServer(sshService, lab.id);

      await this.rebootAndWaitForServer(sshService, lab.id);

      // Execute init.sh
      await this.callInitScript(sshService, lab);

      // execute docker compose up
      await this.callDockerComposeUp(sshService, lab.id);

      // wait for lab manager
      await this.labManagerService.waitForHealthCheck(lab.getLabManagerApiInfo().apiUrl);
    } catch (e) {
      await this.labService.updateServerTask(
        lab.id,
        `Error during server configuration. Error : ${e}`,
        CnLabServerTaskStatus.ERROR
      );
      throw e;
    }
    return lab;
  }

  // pull the lab-configurer repo and update the lab status
  public async updateLabConfigurerRepo(lab: CnLab): Promise<void> {
    const sshService = await this.cloudProviderFactory.getSshLabService(lab);

    try {
      await this.refreshLabConfigurerRepo(sshService, lab.id);
    } catch (e) {
      await this.labService.updateServerTask(
        lab.id,
        `Error while updating lab-configurer repository. Error : ${e}`,
        CnLabServerTaskStatus.ERROR
      );
      throw new Error(`Error while updating lab-configurer repository. Error : ${e}`);
    }
    await this.labService.updateServerTask(
      lab.id,
      `lab-configurer repository updated`,
      CnLabServerTaskStatus.SUCCESS
    );
  }

  /**
   * Method to clone lab-configurer repo if it does not exist or pull if it does
   * @private
   */
  private async refreshLabConfigurerRepo(labSshService: CnLabSshService, labId: string): Promise<void> {
    const cdResult = await labSshService.execSshCommand([`cd ${CnLabSshService.LAB_CONFIGURER_FOLDER}`], {
      errorMode: CnExecCommandMode.STDERR_AS_SUCCESS,
      ignoreError: true,
      timeout: 10000,
    });

    // todo does not work if this is the first time the ssh connection is made
    // if the repo does exist, delete it to re-clone it
    if (cdResult === '') {
      await this.labService.updateServerTask(
        labId,
        `Deleting lab-configurer repository`,
        CnLabServerTaskStatus.RUNNING
      );
      await labSshService.execSshCommand([`rm -rf ${CnLabSshService.LAB_CONFIGURER_FOLDER}`]);
    }
    // clone the repo
    await this.labService.updateServerTask(
      labId,
      `Pulling lab-configurer repository`,
      CnLabServerTaskStatus.RUNNING
    );
    // Git clone
    await labSshService.execSshCommand([
      `git clone -b ${this.coreConfigService.getLabConfigurerRepoBranch()} ` +
        `${this.coreConfigService.getLabConfigurerRepoUrl()}`,
    ]);
  }

  private async mountVolume(lab: CnLab): Promise<void> {
    await this.labService.updateServerTask(lab.id, `Mounting volume`, CnLabServerTaskStatus.RUNNING);

    try {
      const cloudProvider = await this.cloudProviderFactory.getCloudProviderServiceFromLab(lab.id);
      await cloudProvider.mountVolume(lab);
    } catch (e) {
      throw new Error(`Error while mounting volume. Error : ${e}`);
    }
  }

  private async callPrepareServer(labSshService: CnLabSshService, labId: string): Promise<void> {
    await this.labService.updateServerTask(
      labId,
      `Prepare and configure server`,
      CnLabServerTaskStatus.RUNNING
    );
    try {
      await labSshService.execSshCommand([`cd ${labSshService.getUtilsFolder()}`, `bash prepare_server.sh`]);
    } catch (e) {
      throw new Error(`Error while preparing server. Error : ${e}`);
    }
  }

  private async rebootAndWaitForServer(labSshService: CnLabSshService, labId: string): Promise<void> {
    // Reboot server
    await this.labService.updateServerTask(labId, `Rebooting server`, CnLabServerTaskStatus.RUNNING);

    try {
      await labSshService.execSshCommand(['sudo reboot'], {
        errorMode: CnExecCommandMode.STDERR_AS_SUCCESS,
        ignoreError: true,
      });

      await labSshService.waitForSshConnection(3);
    } catch (e) {
      throw new Error(`Error while rebooting server. Error : ${e}`);
    }
  }

  private async callInitScript(labSshService: CnLabSshService, lab: CnLab): Promise<void> {
    const variables = [
      `--virtual-host="${lab.virtualHost}"`,
      `--environment-profile="${this.coreConfigService.isProduction() ? 'prod' : 'pre-prod'}"`,
      `--lab-manager-api-key="${lab.labManagerApiKey}"`,
      `--lab-manager-version="${this.coreConfigService.getLabManagerRecommendedVersion()}"`,
    ];

    this.logger.log(`Run init.sh file for lab ${lab.id}`);
    await labSshService.execSshCommand(
      [`bash ${labSshService.getUtilsFolder()}/init.sh ${variables.join(' ')}`],
      undefined,
      false
    );
  }

  private async callDockerComposeUp(labSshService: CnLabSshService, labId: string): Promise<void> {
    // execute docker compose up
    await this.labService.updateServerTask(labId, `Starting lab manager`, CnLabServerTaskStatus.RUNNING);
    try {
      await labSshService.execSshCommand([
        `cd ${CnLabSshService.LAB_CONFIGURER_FOLDER}`,
        'docker-compose up -d',
      ]);
    } catch (e) {
      throw new Error(`Error while starting lab manager. Error : ${e}`);
    }
  }

  public async updateLabManager(lab: CnLab, labManagerVersion: string): Promise<void> {
    const labSshService = await this.cloudProviderFactory.getSshLabService(lab);

    await this.labService.updateServerTask(
      lab.id,
      `Updating lab manager to version ${labManagerVersion}`,
      CnLabServerTaskStatus.RUNNING
    );

    try {
      await labSshService.execSshCommand([
        `cd ${CnLabSshService.LAB_CONFIGURER_FOLDER}`,
        `. update_lab_manager.sh ${labManagerVersion}`,
      ]);
    } catch (e) {
      const error = `Error while updating lab manager. Error : ${e}`;
      await this.labService.updateServerTask(lab.id, error, CnLabServerTaskStatus.ERROR);
      throw new BlBadRequestException(error);
    }
    await this.labService.updateServerTask(lab.id, `Lab manager updated`, CnLabServerTaskStatus.SUCCESS);
  }

  public async composeDown(lab: CnLab): Promise<void> {
    const labSshService = await this.cloudProviderFactory.getSshLabService(lab);

    // execute docker compose down
    await this.labService.updateServerTask(lab.id, `Destroying containers`, CnLabServerTaskStatus.RUNNING);

    try {
      await labSshService.execSshCommand([
        `cd ${CnLabSshService.LAB_CONFIGURER_FOLDER}`,
        'docker-compose down',
      ]);
    } catch (e) {
      const error = `Error while destroying containers. Error : ${e}`;
      await this.labService.updateServerTask(lab.id, error, CnLabServerTaskStatus.ERROR);
      throw new BlBadRequestException(error);
    }
    await this.labService.updateServerTask(lab.id, `Container destroyed`, CnLabServerTaskStatus.SUCCESS);
  }

  // TODO TO REMOVE ONCE ALL LABS ARE MIGRATED
  public async migrateToGithub(lab: CnLab): Promise<void> {
    const labSshService = await this.cloudProviderFactory.getSshLabService(lab);

    // execute docker compose down
    await this.labService.updateServerTask(lab.id, `Clearing old image`, CnLabServerTaskStatus.RUNNING);

    try {
      await labSshService.execSshCommand([`cd dockerlab`, 'docker-compose down']);

      await labSshService.execSshCommand([`rm -rf dockerlab`]);
    } catch (e) {
      const error = `Error migrating to github. Error : ${e}`;
      await this.labService.updateServerTask(lab.id, error, CnLabServerTaskStatus.ERROR);
      throw new BlBadRequestException(error);
    }
    await this.labService.updateServerTask(lab.id, `Old image cleared`, CnLabServerTaskStatus.SUCCESS);

    await this.configureServer(lab);

    await this.labService.updateServerTask(lab.id, `Migrate Success`, CnLabServerTaskStatus.SUCCESS);
  }
}
