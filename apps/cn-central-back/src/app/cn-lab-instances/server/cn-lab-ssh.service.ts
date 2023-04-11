import {Injectable, Logger} from '@nestjs/common';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnCommandService, CnExecCommandMode} from '../../cn-core/services/cn-command.service';
import {CnLabInstancesService} from '../cn-lab-instances.service';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnLabManagerService} from '../cn-lab-manager.service';
import {BlBadRequestException} from '@monorepo/back-core-lib';

/**
 * Service to execute ssh command to the lab server
 */
@Injectable()
export class CnLabSshService {

  private static readonly DOCKERLAB_FOLDER = 'dockerlab';
  private static readonly SSH_PRIVATE_KEY_LOCATION = '/root/.ssh/id_rsa';

  private readonly logger = new Logger(CnLabSshService.name);

  constructor(private labInstanceService: CnLabInstancesService,
              private commandService: CnCommandService,
              private coreConfigService: CnCoreConfigService,
              private labManagerService: CnLabManagerService) {
  }

  public async configureServer(labInstance: CnLabInstance): Promise<CnLabInstance> {
    // get Dockerlab repository
    await this.refreshDockerlabRepo(labInstance);

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
    await this.labInstanceService.updateServerStatusText(labInstance.id, `Dockerlab repository updated`);
  }

  /**
   * Method to clone dockerlab repo if it does not exist or pull if it does
   * @param labInstance
   * @private
   */
  private async refreshDockerlabRepo(labInstance: CnLabInstance): Promise<void> {
    const cd = this.getSshCommand(labInstance.virtualHost, [`cd ${CnLabSshService.DOCKERLAB_FOLDER}`]);
    const cdResult = await this.commandService.execCommand(cd,
      {errorMode: CnExecCommandMode.STDERR_AS_SUCCESS, ignoreError: true, timeout: 10000});

    // todo does not work if this is the first time the ssh connection is made
    // if the repo does exist, we pull the latest version
    if (cdResult === '') {
      await this.labInstanceService.updateServerStatusText(labInstance.id, `Cloning dockerlab repository`);

      // Git pull
      const gitPull = this.getSshCommand(labInstance.virtualHost, [`cd ${CnLabSshService.DOCKERLAB_FOLDER}`, 'git pull']);
      this.logger.log(`Executing command -- ${gitPull} -- for lab ${labInstance.id}`);
      await this.commandService.execCommand(gitPull);
    } else {
      await this.labInstanceService.updateServerStatusText(labInstance.id, `Pulling dockerlab repository`);
      // Git clone
      // eslint-disable-next-line max-len
      const repo = `https://${this.coreConfigService.getDockerlabRepoUsername()}:${this.coreConfigService.getDockerlabRepoPassword()}@${this.coreConfigService.getDockerlabRepoUrl()}`;
      const gitClone = this.getSshCommand(labInstance.virtualHost, [`git clone ${repo}`]);
      this.logger.log(`Executing clone for dockerlab repository ${this.coreConfigService.getDockerlabRepoUrl()} for lab ${labInstance.id}`);
      await this.commandService.execCommand(gitClone);
    }
  }

  private async callPrepareServer(labInstance: CnLabInstance): Promise<void> {
    await this.labInstanceService.updateServerStatusText(labInstance.id, `Prepare and configure server`);
    const prepareServer = this.getSshCommand(labInstance.virtualHost, [`cd ${CnLabSshService.DOCKERLAB_FOLDER}/utils`,
      'bash prepare_server.sh']);
    this.logger.log(`Executing command -- ${prepareServer} -- for lab ${labInstance.id}`);
    await this.commandService.execCommand(prepareServer);
  }

  private async rebootAndWaitForServer(labInstance: CnLabInstance): Promise<void> {
    // Reboot server
    await this.labInstanceService.updateServerStatusText(labInstance.id, `Rebooting server`);

    const rebootServer = this.getSshCommand(labInstance.virtualHost, ['sudo reboot']);
    this.logger.log(`Executing command -- ${rebootServer} -- for lab ${labInstance.id}`);
    await this.commandService.execCommand(rebootServer,
      {errorMode: CnExecCommandMode.STDERR_AS_SUCCESS, ignoreError: true});

    await this.waitForSshConnection(labInstance, 2);
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

    const runInit = this.getSshCommand(labInstance.virtualHost,
      // eslint-disable-next-line max-len
      [`bash ${CnLabSshService.DOCKERLAB_FOLDER}/utils/init.sh ${variables.join(' ')}`]);
    this.logger.log(`Run init.sh file for lab ${labInstance.id}`);
    await this.commandService.execCommand(runInit);
  }

  private async callDockerComposeUp(labInstance: CnLabInstance): Promise<void> {
    // execute docker compose up
    await this.labInstanceService.updateServerStatusText(labInstance.id, `Starting lab manager`);
    const dockerComposeUp = this.getSshCommand(labInstance.virtualHost, [`cd ${CnLabSshService.DOCKERLAB_FOLDER}`,
      'docker-compose up -d']);
    this.logger.log(`Executing command -- ${dockerComposeUp} -- for lab ${labInstance.id}`);
    await this.commandService.execCommand(dockerComposeUp);
  }

  /**
   * Call ssh regularly to check if the server is up.
   * Raise an exception if the server is not up after 15 * 20 seconds
   * @param labInstance
   * @param consecutiveRequiredSuccess number of consecutive successful ssh calls required to consider the server up and running
   * @private
   */
  public async waitForSshConnection(labInstance: CnLabInstance, consecutiveRequiredSuccess: number = 1): Promise<void> {
    // wait for server to reboot
    let count = 0;
    let successCount = 0;
    while (count < 20) {

      const result = await this.checkSshConnection(labInstance.virtualHost);
      if (result) {
        successCount++;

        if (successCount >= consecutiveRequiredSuccess) {
          return;
        }
      } else {
        successCount = 0;
      }

      // eslint-disable-next-line max-len
      this.logger.log(`Waiting for server to be available for lab ${labInstance.id}. Attempt ${count + 1} of 15. Success ${successCount} of ${consecutiveRequiredSuccess}`);
      // wait 15 seconds
      await new Promise(r => setTimeout(r, 15000));
      count++;
    }

    throw new BlBadRequestException(`Server is not available for lab ${labInstance.id}`);
  }

  public async checkSshConnection(virtualHost: string): Promise<boolean> {

    // option to add host to fingerprint
    // use a cat because sometimes the ssh never finishes, and it blocks the process.
    // it requires to kill the process manually, it happens less with cat
    // TODO TO improve check
    const command = `ssh -o StrictHostKeyChecking=no ubuntu@lab.${virtualHost} "ls"`;
    // use ping because it does not block
    // const command = `ping lab.${virtualHost}`;
    this.logger.log(`Checking ssh connection for ${virtualHost}`);
    try {
      await this.commandService.execCommand(command, {errorMode: CnExecCommandMode.STDERR_AS_WARNING, timeout: 10000});
      return true;
    } catch (e) {
      this.logger.log(e.toString());
      return false;
    }
  }

  private getSshCommand(virtualHost: string, commands: string[]): string {
    // in pre-prod and prod env, set the path to the ssh key
    const option = this.coreConfigService.isLocal() ? '' : `-i ${CnLabSshService.SSH_PRIVATE_KEY_LOCATION}`;
    return `ssh ${option} -o StrictHostKeyChecking=no ubuntu@lab.${virtualHost} "${commands.join(';')}"`;
  }

  public async updateLabManager(labInstance: CnLabInstance, labManagerVersion: string): Promise<void> {
    await this.labInstanceService.updateServerStatusText(labInstance.id, `Updating lab manager to version ${labManagerVersion}`);
    const updateLabManager = this.getSshCommand(labInstance.virtualHost, [`cd ${CnLabSshService.DOCKERLAB_FOLDER}`,
      `. update_lab_manager.sh ${labManagerVersion}`]);
    this.logger.log(`Executing command -- ${updateLabManager} -- for lab ${labInstance.id}`);
    await this.commandService.execCommand(updateLabManager);
    await this.labInstanceService.updateServerStatusText(labInstance.id, `Lab manager updated`);
  }
}
