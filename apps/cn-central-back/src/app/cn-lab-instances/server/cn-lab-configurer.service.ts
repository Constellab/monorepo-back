import {Injectable, Logger} from '@nestjs/common';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnExecCommandMode} from '../../cn-core/services/cn-command.service';
import {CnLabInstancesService} from '../cn-lab-instances.service';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnLabManagerService} from '../cn-lab-manager.service';
import {CnLabSshService} from './cn-lab-ssh.service';
import {CnCloudProviderFactory} from './cn-cloud-provider.factory';
import {CnLabInstanceServerTaskStatus} from '../status/cn-lab-instance-status.enum';

/**
 * Service to configure the lab server.
 * Almost same configuration for all servers (all cloud providers)
 */
@Injectable()
export class CnLabConfigurerService {

  private readonly logger = new Logger(CnLabConfigurerService.name);

  constructor(private labInstanceService: CnLabInstancesService,
              private labSshService: CnLabSshService,
              private coreConfigService: CnCoreConfigService,
              private labManagerService: CnLabManagerService,
              private cloudProviderFactory: CnCloudProviderFactory) {
  }

  public async configureServer(labInstance: CnLabInstance): Promise<CnLabInstance> {
    // get Dockerlab repository
    await this.refreshDockerlabRepo(labInstance);

    // mount volume
    await this.mountVolume(labInstance);

    // Execute prepare_server.sh
    await this.callPrepareServer(labInstance);

    await this.rebootAndWaitForServer(labInstance);

    // Execute init.sh
    await this.callInitScript(labInstance);

    // execute docker compose up
    await this.callDockerComposeUp(labInstance);

    // wait for lab manager
    await this.labManagerService.waitForHealthCheck(labInstance.getLabManagerApiInfo().apiUrl);

    return labInstance;
  }

  // pull the dockerlab repo and update the lab instance status
  public async updateDockerlabRepo(labInstance: CnLabInstance): Promise<void> {
    await this.refreshDockerlabRepo(labInstance);
    await this.labInstanceService.updateServerTask(labInstance.id, `Dockerlab repository updated`, CnLabInstanceServerTaskStatus.SUCCESS);
  }

  /**
   * Method to clone dockerlab repo if it does not exist or pull if it does
   * @param labInstance
   * @private
   */
  private async refreshDockerlabRepo(labInstance: CnLabInstance): Promise<void> {
    const cdResult = await this.labSshService.execSshCommand(labInstance,
      [`cd ${CnLabSshService.DOCKERLAB_FOLDER}`],
      {errorMode: CnExecCommandMode.STDERR_AS_SUCCESS, ignoreError: true, timeout: 10000});

    // todo does not work if this is the first time the ssh connection is made
    // if the repo does exist, delete it to re-clone it
    if (cdResult === '') {
      await this.labInstanceService.updateServerTask(labInstance.id, `Deleting dockerlab repository`,
        CnLabInstanceServerTaskStatus.RUNNING);
      await this.labSshService.execSshCommand(labInstance, [`rm -rf ${CnLabSshService.DOCKERLAB_FOLDER}`]);
    }
    // clone the repo
    await this.labInstanceService.updateServerTask(labInstance.id, `Pulling dockerlab repository`, CnLabInstanceServerTaskStatus.RUNNING);
    // Git clone
    // eslint-disable-next-line max-len
    const repo = `https://${this.coreConfigService.getDockerlabRepoUsername()}:${this.coreConfigService.getDockerlabRepoPassword()}@${this.coreConfigService.getDockerlabRepoUrl()}`;
    const branch = this.coreConfigService.getDockerlabRepoBranch();
    await this.labSshService.execSshCommand(labInstance, [`git clone -b ${branch} ${repo}`]);
  }

  private async mountVolume(labInstance: CnLabInstance): Promise<void> {
    await this.labInstanceService.updateServerTask(labInstance.id, `Mounting volume`, CnLabInstanceServerTaskStatus.RUNNING);
    const cloudProvider = this.cloudProviderFactory.getCloudProviderService(labInstance.getCloudProviderName());
    await cloudProvider.mountVolume(labInstance);
  }

  private async callPrepareServer(labInstance: CnLabInstance): Promise<void> {
    await this.labInstanceService.updateServerTask(labInstance.id, `Prepare and configure server`, CnLabInstanceServerTaskStatus.RUNNING);
    await this.labSshService.execSshCommand(labInstance, [`cd ${this.labSshService.getUtilsFolder()}`,
      `bash prepare_server.sh`]);
  }

  private async rebootAndWaitForServer(labInstance: CnLabInstance): Promise<void> {
    // Reboot server
    await this.labInstanceService.updateServerTask(labInstance.id, `Rebooting server`, CnLabInstanceServerTaskStatus.RUNNING);

    await this.labSshService.execSshCommand(labInstance, ['sudo reboot'],
      {errorMode: CnExecCommandMode.STDERR_AS_SUCCESS, ignoreError: true});

    await this.labSshService.waitForSshConnection(labInstance, 2);
  }


  private async callInitScript(labInstance: CnLabInstance): Promise<void> {

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
    await this.labSshService.execSshCommand(labInstance,
      [`bash ${this.labSshService.getUtilsFolder()}/init.sh ${variables.join(' ')}`], undefined, false);
  }

  private async callDockerComposeUp(labInstance: CnLabInstance): Promise<void> {
    // execute docker compose up
    await this.labInstanceService.updateServerTask(labInstance.id, `Starting lab manager`,CnLabInstanceServerTaskStatus.RUNNING);
    await this.labSshService.execSshCommand(labInstance,
      [`cd ${CnLabSshService.DOCKERLAB_FOLDER}`, 'docker-compose up -d']);
  }

  public async updateLabManager(labInstance: CnLabInstance, labManagerVersion: string): Promise<void> {
    await this.labInstanceService.updateServerTask(labInstance.id, `Updating lab manager to version ${labManagerVersion}`,
      CnLabInstanceServerTaskStatus.RUNNING);
    await this.labSshService.execSshCommand(labInstance,
      [`cd ${CnLabSshService.DOCKERLAB_FOLDER}`, `. update_lab_manager.sh ${labManagerVersion}`]);
    await this.labInstanceService.updateServerTask(labInstance.id, `Lab manager updated`, CnLabInstanceServerTaskStatus.SUCCESS);
  }


}
