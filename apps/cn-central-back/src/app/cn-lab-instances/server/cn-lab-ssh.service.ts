import {Injectable, Logger} from '@nestjs/common';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnCommandService, CnExecCommandMode, CnExecOptions} from '../../cn-core/services/cn-command.service';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';

/**
 * Service to execute ssh command to the lab server
 */
@Injectable()
export class CnLabSshService {

  private static readonly SSH_PRIVATE_KEY_LOCATION = '/root/.ssh/id_rsa';
  public static readonly DOCKERLAB_FOLDER = 'dockerlab';


  private readonly logger = new Logger(CnLabSshService.name);

  constructor(private commandService: CnCommandService,
              private coreConfigService: CnCoreConfigService) {
  }

  public execSshCommand(labInstance: CnLabInstance, commands: string[], options?: CnExecOptions,
                        logCommand: boolean = true): Promise<string> {
    const command = this.getSshCommand(labInstance.virtualHost, commands);
    if (logCommand) {
      this.logger.log(`Executing command -- ${command} -- for lab ${labInstance.id}`);
    }
    return this.commandService.execCommand(command, options);
  }

  private getSshCommand(virtualHost: string, commands: string[]): string {
    // in pre-prod and prod env, set the path to the ssh key
    const option = this.coreConfigService.isLocal() ? '' : `-i ${CnLabSshService.SSH_PRIVATE_KEY_LOCATION}`;
    return `ssh ${option} -o StrictHostKeyChecking=no ubuntu@lab.${virtualHost} "${commands.join(';')}"`;
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
    const countLimit = 20;
    while (count < countLimit) {

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
      this.logger.log(`Waiting for server to be available for lab ${labInstance.id}. Attempt ${count + 1} of ${countLimit}. Success ${successCount} of ${consecutiveRequiredSuccess}`);
      // wait 15 seconds
      await new Promise(r => setTimeout(r, 15000));
      count++;
    }

    throw new BlBadRequestException(`Server is not available for lab ${labInstance.id}`);
  }

  public async checkSshConnection(virtualHost: string): Promise<boolean> {

    // option to add host to fingerprint
    const command = `ssh -q -o StrictHostKeyChecking=no -o ConnectTimeout=3 ubuntu@lab.${virtualHost} exit`
    this.logger.log(`Checking ssh connection for ${virtualHost}`);
    try {
      await this.commandService.execCommand(command, {errorMode: CnExecCommandMode.STDERR_AS_WARNING, timeout: 10000});
      return true;
    } catch (e) {
      this.logger.log(e.toString());
      return false;
    }
  }

  public getUtilsFolder(): string {
    return `${CnLabSshService.DOCKERLAB_FOLDER}/utils`;
  }

  public getMountFolder(): string {
    return `${this.getUtilsFolder()}/mount`;
  }

}
