import {Injectable, Logger} from '@nestjs/common';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnExecCommandMode} from '../../cn-core/services/cn-command.service';
import {CnLabInstancesService} from '../cn-lab-instances.service';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnLabManagerService} from '../cn-lab-manager.service';
import {CnLabSshService} from './cn-lab-ssh.service';
import {CnCloudProviderFactory} from './cn-cloud-provider.factory';
import {CnLabInstanceServerTaskStatus} from '../status/cn-lab-instance-status.enum';
import {BlBadRequestException} from '@monorepo/back-core-lib';

/**
 * Service to configure the lab server.
 * Almost same configuration for all servers (all cloud providers)
 */
@Injectable()
export class CnLabConfigurerService {

  private readonly logger = new Logger(CnLabConfigurerService.name);

  constructor(private labInstanceService: CnLabInstancesService,
              private coreConfigService: CnCoreConfigService,
              private labManagerService: CnLabManagerService,
              private cloudProviderFactory: CnCloudProviderFactory) {
  }

  public async configureServer(labInstance: CnLabInstance): Promise<CnLabInstance> {
    try {

      const sshService = await this.cloudProviderFactory.getSshLabService(labInstance);

      // get Dockerlab repository
      await this.refreshDockerlabRepo(sshService, labInstance.id);

      // mount volume
      await this.mountVolume(labInstance);

      // Execute prepare_server.sh
      await this.callPrepareServer(sshService, labInstance.id);

      await this.rebootAndWaitForServer(sshService, labInstance.id);

      // Execute init.sh
      await this.callInitScript(sshService, labInstance);

      // execute docker compose up
      await this.callDockerComposeUp(sshService, labInstance.id);

      // wait for lab manager
      await this.labManagerService.waitForHealthCheck(labInstance.getLabManagerApiInfo().apiUrl);

    } catch (e) {
      await this.labInstanceService.updateServerTask(labInstance.id, `Error during server configuration. Error : ${e}`,
        CnLabInstanceServerTaskStatus.ERROR);
      throw e;
    }
    return labInstance;
  }

  // pull the dockerlab repo and update the lab instance status
  public async updateDockerlabRepo(labInstance: CnLabInstance): Promise<void> {
    const sshService = await this.cloudProviderFactory.getSshLabService(labInstance);

    try {
      await this.refreshDockerlabRepo(sshService, labInstance.id);
    } catch (e) {
      await this.labInstanceService.updateServerTask(labInstance.id, `Error while updating dockerlab repository. Error : ${e}`,
        CnLabInstanceServerTaskStatus.ERROR);
      throw new Error(`Error while updating dockerlab repository. Error : ${e}`);
    }
    await this.labInstanceService.updateServerTask(labInstance.id, `Dockerlab repository updated`, CnLabInstanceServerTaskStatus.SUCCESS);
  }

  /**
   * Method to clone dockerlab repo if it does not exist or pull if it does
   * @private
   */
  private async refreshDockerlabRepo(labSshService: CnLabSshService, labId: string): Promise<void> {
    const cdResult = await labSshService.execSshCommand([`cd ${CnLabSshService.DOCKERLAB_FOLDER}`],
      {errorMode: CnExecCommandMode.STDERR_AS_SUCCESS, ignoreError: true, timeout: 10000});

    // todo does not work if this is the first time the ssh connection is made
    // if the repo does exist, delete it to re-clone it
    if (cdResult === '') {
      await this.labInstanceService.updateServerTask(labId, `Deleting dockerlab repository`,
        CnLabInstanceServerTaskStatus.RUNNING);
      await labSshService.execSshCommand([`rm -rf ${CnLabSshService.DOCKERLAB_FOLDER}`]);
    }
    // clone the repo
    await this.labInstanceService.updateServerTask(labId, `Pulling dockerlab repository`, CnLabInstanceServerTaskStatus.RUNNING);
    // Git clone
    // eslint-disable-next-line max-len
    const repo = `https://${this.coreConfigService.getDockerlabRepoUsername()}:${this.coreConfigService.getDockerlabRepoPassword()}@${this.coreConfigService.getDockerlabRepoUrl()}`;
    const branch = this.coreConfigService.getDockerlabRepoBranch();
    await labSshService.execSshCommand([`git clone -b ${branch} ${repo}`]);
  }

  private async mountVolume(labInstance: CnLabInstance): Promise<void> {
    await this.labInstanceService.updateServerTask(labInstance.id, `Mounting volume`, CnLabInstanceServerTaskStatus.RUNNING);

    try {
      const cloudProvider = await this.cloudProviderFactory.getCloudProviderServiceFromLab(labInstance.id);
      await cloudProvider.mountVolume(labInstance);
    } catch (e) {
      throw new Error(`Error while mounting volume. Error : ${e}`);
    }
  }

  private async callPrepareServer(labSshService: CnLabSshService, labId: string): Promise<void> {
    await this.labInstanceService.updateServerTask(labId, `Prepare and configure server`, CnLabInstanceServerTaskStatus.RUNNING);
    try {
      await labSshService.execSshCommand([`cd ${labSshService.getUtilsFolder()}`,
        `bash prepare_server.sh`]);
    } catch (e) {
      throw new Error(`Error while preparing server. Error : ${e}`);
    }
  }

  private async rebootAndWaitForServer(labSshService: CnLabSshService, labId: string): Promise<void> {
    // Reboot server
    await this.labInstanceService.updateServerTask(labId, `Rebooting server`, CnLabInstanceServerTaskStatus.RUNNING);

    try {
      await labSshService.execSshCommand(['sudo reboot'],
        {errorMode: CnExecCommandMode.STDERR_AS_SUCCESS, ignoreError: true});

      await labSshService.waitForSshConnection(2);
    } catch (e) {
      throw new Error(`Error while rebooting server. Error : ${e}`);
    }
  }


  private async callInitScript(labSshService: CnLabSshService, labInstance: CnLabInstance): Promise<void> {

    const variables = [
      labInstance.virtualHost,
      this.coreConfigService.isProduction() ? 'prod' : 'pre-prod',
      labInstance.labManagerApiKey,
      this.coreConfigService.getDockerRegistryUrl(),
      this.coreConfigService.getDockerRegistryUsername(),
      this.coreConfigService.getDockerRegistryPassword(),
      this.coreConfigService.getLabManagerRecommendedVersion()
    ];

    this.logger.log(`Run init.sh file for lab ${labInstance.id}`);
    await labSshService.execSshCommand([`bash ${labSshService.getUtilsFolder()}/init.sh ${variables.join(' ')}`],
      undefined, false);
  }

  private async callDockerComposeUp(labSshService: CnLabSshService, labId: string): Promise<void> {
    // execute docker compose up
    await this.labInstanceService.updateServerTask(labId, `Starting lab manager`, CnLabInstanceServerTaskStatus.RUNNING);
    try {
      await labSshService.execSshCommand([`cd ${CnLabSshService.DOCKERLAB_FOLDER}`, 'docker-compose up -d']);
    } catch (e) {
      throw new Error(`Error while starting lab manager. Error : ${e}`);
    }
  }

  public async updateLabManager(labInstance: CnLabInstance, labManagerVersion: string): Promise<void> {
    const labSshService = await this.cloudProviderFactory.getSshLabService(labInstance);

    await this.labInstanceService.updateServerTask(labInstance.id, `Updating lab manager to version ${labManagerVersion}`,
      CnLabInstanceServerTaskStatus.RUNNING);

    try {
      await labSshService.execSshCommand(
        [`cd ${CnLabSshService.DOCKERLAB_FOLDER}`, `. update_lab_manager.sh ${labManagerVersion}`]);
    } catch (e) {
      const error = `Error while updating lab manager. Error : ${e}`;
      await this.labInstanceService.updateServerTask(labInstance.id, error, CnLabInstanceServerTaskStatus.ERROR);
      throw new BlBadRequestException(error);
    }
    await this.labInstanceService.updateServerTask(labInstance.id, `Lab manager updated`, CnLabInstanceServerTaskStatus.SUCCESS);
  }


}
