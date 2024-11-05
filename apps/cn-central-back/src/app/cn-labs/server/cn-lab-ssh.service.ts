import { Logger } from '@nestjs/common';
import {
  CnCommandService,
  CnExecCommandMode,
  CnExecOptions,
} from '../../cn-core/services/cn-command.service';
import { BlBadRequestException } from '@monorepo/back-core-lib';

/**
 * Service to execute ssh command to the lab server
 */
export class CnLabSshService {
  public static readonly SSH_PRIVATE_KEY_LOCATION = '/root/.ssh';
  public static readonly LAB_CONFIGURER_FOLDER = 'lab-configurer';

  private readonly logger = new Logger(CnLabSshService.name);

  private readonly sshKeyFilePath: string;

  constructor(
    private readonly commandService: CnCommandService,
    private readonly isLocal: boolean,
    private readonly sshUserName: string,
    private readonly labVirtualHost: string,
    private readonly labId: string,
    sshKeyFileName: string
  ) {
    this.sshKeyFilePath = CnLabSshService.SSH_PRIVATE_KEY_LOCATION + '/' + sshKeyFileName;
  }

  public execSshCommand(
    commands: string[],
    options?: CnExecOptions,
    logCommand: boolean = true
  ): Promise<string> {
    const command = this.getSshCommand(commands);
    if (logCommand) {
      this.logger.log(`Executing command -- ${command} -- for lab ${this.labId}`);
    }
    return this.commandService.execCommand(command, options);
  }

  private getSshCommand(commands: string[], options: string[] = []): string {
    // in pre-prod and prod env, set the path to the ssh key
    if (this.isLocal) {
      this.logger.debug('Running ssh command locally.');
    } else {
      this.logger.debug(`Running ssh command with rsa file : ${this.sshKeyFilePath}.`);
      options.push(`-i ${this.sshKeyFilePath}`);
    }
    return `ssh ${options.join(' ')} -o StrictHostKeyChecking=no ${this.sshUserName}@lab.${this.labVirtualHost} "${commands.join(';')}"`;
  }

  /**
   * Call ssh regularly to check if the server is up.
   * Raise an exception if the server is not up after 15 * 20 seconds
   * @param consecutiveRequiredSuccess number of consecutive successful ssh calls required to consider the server up and running
   * @private
   */
  public async waitForSshConnection(consecutiveRequiredSuccess: number = 1): Promise<void> {
    // wait for server to reboot
    let count = 0;
    let successCount = 0;
    const countLimit = 30;
    const waitTime = 15000;
    while (count < countLimit) {
      const result = await this.checkSshConnection();
      if (result) {
        successCount++;

        if (successCount >= consecutiveRequiredSuccess) {
          return;
        }
      } else {
        successCount = 0;
      }

      // eslint-disable-next-line max-len
      this.logger.log(
        `Waiting for server to be available for lab ${this.labId}. Attempt ${count + 1} of ${countLimit}. Success ${successCount} of ${consecutiveRequiredSuccess}`
      );
      // wait 15 seconds
      await new Promise((r) => setTimeout(r, waitTime));
      count++;
    }

    throw new BlBadRequestException(`Server is not available for lab ${this.labId}`);
  }

  public async checkSshConnection(): Promise<boolean> {
    // option to add host to fingerprint
    const command = this.getSshCommand(['exit'], ['-q', '-o ConnectTimeout=3']);
    this.logger.log(`Checking ssh connection for ${this.labVirtualHost} lab ${this.labId}`);
    try {
      await this.commandService.execCommand(command, {
        errorMode: CnExecCommandMode.STDERR_AS_WARNING,
        timeout: 10000,
      });
      return true;
    } catch (e) {
      this.logger.log(e.toString());
      return false;
    }
  }

  public getUtilsFolder(): string {
    return `${CnLabSshService.LAB_CONFIGURER_FOLDER}/utils`;
  }

  public getMountFolder(): string {
    return `${this.getUtilsFolder()}/mount`;
  }
}
