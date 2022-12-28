import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnCommandService, CnExecCommandMode} from '../../cn-core/services/cn-command.service';
import {CnLabInstancesService} from '../cn-lab-instances.service';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnLabCloudProviderService} from './cn-lab-cloud-provider.service';

@Injectable()
export class CnLabSshService {

  private static readonly DOCKERLAB_FOLDER = 'dockerlab';
  private static readonly DOCKERLAB_REPO = 'gitlab.com/gencovery/infra/dockerlab.git';

  private readonly logger = new Logger(CnLabCloudProviderService.name);

  constructor(private labInstanceService: CnLabInstancesService,
              private commandService: CnCommandService,
              private coreConfigService: CnCoreConfigService) {
  }

  public async initLabServer(labInstance: CnLabInstance): Promise<CnLabInstance> {
    // get Dockerlab repository
    await this.refreshDockerlabRepo(labInstance);

    // Execute prepare_server.sh
    const prepareServer = this.getSshCommand(labInstance.virtualHost, [`cd ${CnLabSshService.DOCKERLAB_FOLDER}/utils`,
      'bash prepare_server.sh']);
    this.logger.log(`Executing command -- ${prepareServer} -- for lab ${labInstance.id}`);
    await this.commandService.execCommand(prepareServer);

    await this.rebootAndWaitForServer(labInstance);


    // Execute init.sh with variables
    const env = this.coreConfigService.isProduction() ? 'prod' : 'pre-prod';
    const runInit = this.getSshCommand(labInstance.virtualHost,
      [`bash ${CnLabSshService.DOCKERLAB_FOLDER}/utils/init.sh ${labInstance.virtualHost} ${env} ${labInstance.labManagerApiKey}`]);
    this.logger.log(`Run init.sh file for lab ${labInstance.id}`);
    await this.commandService.execCommand(runInit);

    // execute docker compose up
    const dockerComposeUp = this.getSshCommand(labInstance.virtualHost, [`cd ${CnLabSshService.DOCKERLAB_FOLDER}`,
      'docker-compose up -d']);
    this.logger.log(`Executing command -- ${dockerComposeUp} -- for lab ${labInstance.id}`);
    await this.commandService.execCommand(dockerComposeUp);

    return labInstance;
  }

  /**
   * Method to clone dockerlab repo if it does not exist or pull if it does
   * @param labInstance
   * @private
   */
  private async refreshDockerlabRepo(labInstance: CnLabInstance): Promise<void> {
    const cd = this.getSshCommand(labInstance.virtualHost, [`cd ${CnLabSshService.DOCKERLAB_FOLDER}`]);
    const cdResult = await this.commandService.execCommand(cd, CnExecCommandMode.STDERR_AS_SUCCESS, true);

    // if the repo does exist, we pull the latest version
    if (cdResult === '') {
      // Git pull
      const gitPull = this.getSshCommand(labInstance.virtualHost, [`cd ${CnLabSshService.DOCKERLAB_FOLDER}`, 'git pull']);
      this.logger.log(`Executing command -- ${gitPull} -- for lab ${labInstance.id}`);
      await this.commandService.execCommand(gitPull);
    } else {
      // Git clone
      // eslint-disable-next-line max-len
      const repo = `https://${this.coreConfigService.getGitUsername()}:${this.coreConfigService.getGitPassword()}@${CnLabSshService.DOCKERLAB_REPO}`;
      const gitClone = this.getSshCommand(labInstance.virtualHost, [`git clone ${repo}`]);
      this.logger.log(`Executing clone for dockerlab repository ${CnLabSshService.DOCKERLAB_REPO} for lab ${labInstance.id}`);
      await this.commandService.execCommand(gitClone);
    }
  }

  private async rebootAndWaitForServer(labInstance: CnLabInstance): Promise<void> {
    // Reboot server
    const rebootServer = this.getSshCommand(labInstance.virtualHost, ['sudo reboot']);
    this.logger.log(`Executing command -- ${rebootServer} -- for lab ${labInstance.id}`);
    await this.commandService.execCommand(rebootServer, CnExecCommandMode.STDERR_AS_SUCCESS, true);

    await this.waitForSshConnection(labInstance);
  }

  /**
   * Call ssh regularly to check if the server is up. Timeout after 100000 seconds
   * Raise an exception if the server is not up after 100000 seconds
   * @param labInstance
   * @private
   */
  public async waitForSshConnection(labInstance: CnLabInstance): Promise<void> {
    // wait for server to reboot
    let count = 0;
    while (count < 10) {

      const result = await this.checkSshConnection(labInstance.virtualHost);
      if (result) {
        return;
      }

      if (count >= 10) {
        break;
      }

      this.logger.log(`Waiting for server to be available for lab ${labInstance.id}. Attempt ${count + 1} of 10`);
      // wait 10 seconds
      await new Promise(r => setTimeout(r, 10000));
      count++;
    }

    throw new BadRequestException(`Server is not available for lab ${labInstance.id}`);
  }

  public async checkSshConnection(virtualHost: string): Promise<boolean> {

    // option to add host to fingerprint
    // use a cat because sometimes the ssh never finishes, and it blocks the process.
    // it requires to kill the process manually, it happens less with cat
    // TODO TO improve check
    const command = `ssh -o StrictHostKeyChecking=no ubuntu@lab.${virtualHost} "cat /var/log/auth.log"`;
    this.logger.log(`Checking ssh connection for ${virtualHost}`);
    try {
      await this.commandService.execCommand(command, CnExecCommandMode.STDERR_AS_WARNING);
      return true;
    } catch (e) {
      return false;
    }
  }

  private getSshCommand(virtualHost: string, commands: string[]): string {
    return `ssh ubuntu@lab.${virtualHost} "${commands.join(';')}"`;
  }
}
