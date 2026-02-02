import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';

import { cnExternalLabQueryParamKeyHeader } from '../../cn-core/model/config/cn-config.class';
import { CnCoreConfigService } from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnExecCommandMode } from '../../cn-core/services/cn-command.service';
import { CnLab } from '../cn-lab.entity';
import { CnLabManagerService } from '../cn-lab-manager.service';
import { CnLabsService } from '../cn-labs.service';
import { CnLabServerTaskStatus } from '../status/cn-lab-status.enum';
import { CnCloudProviderFactory } from './cn-cloud-provider.factory';
import { CnLabSshService } from './cn-lab-ssh.service';

/**
 * Service to configure the lab server.
 * Almost same configuration for all servers (all cloud providers)
 */
@Injectable()
export class CnLabConfigurerService {
  private readonly logger = new Logger(CnLabConfigurerService.name);

  private static DNS_CHALLENGE_ENABLED_VALUE = 'true';
  private static DNS_CHALLENGE_PROVIDER_VALUE = 'httpreq';

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
      await this.callUpdateLabConfigurerRepo(sshService, lab.id);

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
    } catch (e: any) {
      await this.labService.updateServerTask(
        lab.id,
        `Error during server configuration. Error : ${e}`,
        CnLabServerTaskStatus.ERROR
      );
      throw e;
    }
    return lab;
  }

  /**
   * Method to update lab-configurer repo with task updates
   */
  public async updateLabConfigurerRepoWithTask(lab: CnLab): Promise<void> {
    const sshService = await this.cloudProviderFactory.getSshLabService(lab);

    try {
      await this.callUpdateLabConfigurerRepo(sshService, lab.id);
    } catch (e: any) {
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
   * Method to clone lab-configurer repo. Always deletes existing folder and clones fresh.
   */
  public async callUpdateLabConfigurerRepo(labSshService: CnLabSshService, labId: string): Promise<void> {
    // Always delete the folder if it exists, then clone fresh
    // rm -rf with -f flag won't fail if folder doesn't exist
    await this.labService.updateServerTask(
      labId,
      `Deleting lab-configurer repository`,
      CnLabServerTaskStatus.RUNNING
    );
    await labSshService.execSshCommand([`rm -rf ${CnLabSshService.LAB_CONFIGURER_FOLDER}`], {
      errorMode: CnExecCommandMode.STDERR_AS_SUCCESS,
      ignoreError: true,
    });

    // Clone the repo
    await this.labService.updateServerTask(
      labId,
      `Pulling lab-configurer repository`,
      CnLabServerTaskStatus.RUNNING
    );
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
    } catch (e: any) {
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
    } catch (e: any) {
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
    } catch (e: any) {
      throw new Error(`Error while rebooting server. Error : ${e}`);
    }
  }

  private async callInitScript(labSshService: CnLabSshService, lab: CnLab): Promise<void> {
    const challengeRoute =
      `${this.coreConfigService.getApiUrl()}/external-labs-manager/lab/dns` +
      `?${cnExternalLabQueryParamKeyHeader}=${lab.labManagerApiKey}`;
    const variables = [
      `--virtual-host="${lab.virtualHost}"`,
      `--environment-profile="${this.coreConfigService.isProduction() ? 'prod' : 'pre-prod'}"`,
      `--lab-manager-api-key="${lab.labManagerApiKey}"`,
      `--lab-manager-version="${this.coreConfigService.getLabManagerRecommendedVersion()}"`,
      `--dns-challenge-enabled="${CnLabConfigurerService.DNS_CHALLENGE_ENABLED_VALUE}"`,
      `--dns-challenge-provider="${CnLabConfigurerService.DNS_CHALLENGE_PROVIDER_VALUE}"`,
      `--dns-challenge-route="${challengeRoute}"`,
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
        'docker compose up -d',
      ]);
    } catch (e: any) {
      throw new Error(`Error while starting lab manager. Error : ${e}`);
    }
  }

  private async callDockerComposeDown(labSshService: CnLabSshService, labId: string): Promise<void> {
    // execute docker compose down
    await this.labService.updateServerTask(labId, `Stopping lab manager`, CnLabServerTaskStatus.RUNNING);
    try {
      await labSshService.execSshCommand([
        `cd ${CnLabSshService.LAB_CONFIGURER_FOLDER}`,
        'docker compose down',
      ]);
    } catch (e: any) {
      throw new Error(`Error while stopping lab manager. Error : ${e}`);
    }
  }

  public async updateLabManager(lab: CnLab, labManagerVersion: string): Promise<void> {
    const labSshService = await this.cloudProviderFactory.getSshLabService(lab);

    await labSshService.execSshCommand([
      `cd ${CnLabSshService.LAB_CONFIGURER_FOLDER}`,
      `. update_lab_manager.sh ${labManagerVersion}`,
    ]);
  }

  public async composeUp(lab: CnLab): Promise<void> {
    const labSshService = await this.cloudProviderFactory.getSshLabService(lab);

    try {
      await this.callDockerComposeUp(labSshService, lab.id);
    } catch (e: any) {
      const error = `Error while starting containers. Error : ${e}`;
      await this.labService.updateServerTask(lab.id, error, CnLabServerTaskStatus.ERROR);
      throw new BlBadRequestException(error);
    }

    await this.labService.updateServerTask(lab.id, `Lab manager started`, CnLabServerTaskStatus.SUCCESS);
  }

  public async composeDown(lab: CnLab): Promise<void> {
    const labSshService = await this.cloudProviderFactory.getSshLabService(lab);

    try {
      await this.callDockerComposeDown(labSshService, lab.id);
    } catch (e: any) {
      const error = `Error while destroying containers. Error : ${e}`;
      await this.labService.updateServerTask(lab.id, error, CnLabServerTaskStatus.ERROR);
      throw new BlBadRequestException(error);
    }
    await this.labService.updateServerTask(lab.id, `Lab manager destroyed`, CnLabServerTaskStatus.SUCCESS);
  }

  // TODO TO REMOVE ONCE ALL LABS ARE MIGRATED
  public async migrateToGithub(lab: CnLab): Promise<void> {
    const labSshService = await this.cloudProviderFactory.getSshLabService(lab);

    // execute docker compose down
    await this.labService.updateServerTask(lab.id, `Clearing old image`, CnLabServerTaskStatus.RUNNING);

    try {
      await this.callDockerComposeDown(labSshService, lab.id);

      await labSshService.execSshCommand([`rm -rf dockerlab`]);
    } catch (e: any) {
      const error = `Error migrating to github. Error : ${e}`;
      await this.labService.updateServerTask(lab.id, error, CnLabServerTaskStatus.ERROR);
      throw new BlBadRequestException(error);
    }
    await this.labService.updateServerTask(lab.id, `Old image cleared`, CnLabServerTaskStatus.SUCCESS);

    await this.configureServer(lab);

    await this.labService.updateServerTask(lab.id, `Migrate Success`, CnLabServerTaskStatus.SUCCESS);
  }

  public async migrateToDnsChallenge(lab: CnLab): Promise<void> {
    const labSshService = await this.cloudProviderFactory.getSshLabService(lab);

    // execute docker compose down
    await this.labService.updateServerTask(
      lab.id,
      `Migrating to DNS Challenge`,
      CnLabServerTaskStatus.RUNNING
    );

    try {
      // get lab configurer repository
      await this.callUpdateLabConfigurerRepo(labSshService, lab.id);

      // Execute init.sh
      await this.callInitScript(labSshService, lab);

      // execute docker compose down
      await this.callDockerComposeDown(labSshService, lab.id);
      // execute docker compose up
      await this.callDockerComposeUp(labSshService, lab.id);
    } catch (e: any) {
      const error = `Error while migrating to DNS Challenge. Error : ${e}`;
      await this.labService.updateServerTask(lab.id, error, CnLabServerTaskStatus.ERROR);
      throw new BlBadRequestException(error);
    }

    await this.labService.updateServerTask(
      lab.id,
      `Migrating to DNS Challenge Success`,
      CnLabServerTaskStatus.SUCCESS
    );
  }

  public async migrateAccessRight(lab: CnLab): Promise<void> {
    const labSshService = await this.cloudProviderFactory.getSshLabService(lab);

    // Update lab configurer repository
    await this.callUpdateLabConfigurerRepo(labSshService, lab.id);

    // Call migrate_access_right.sh script
    await this.labService.updateServerTask(
      lab.id,
      `Running migrate_access_right.sh`,
      CnLabServerTaskStatus.RUNNING
    );
    await labSshService.execSshCommand([
      `cd ${CnLabSshService.LAB_CONFIGURER_FOLDER}`,
      'bash migrate_access_right.sh',
    ]);
  }

  /**
   * Migration to 2.3.0. It needs the new lab-configurer repo for the new version of traefik.
   */
  public async updateLabConfigurerRepo(lab: CnLab): Promise<void> {
    const labSshService = await this.cloudProviderFactory.getSshLabService(lab);
    // Update lab configurer repository
    await this.callUpdateLabConfigurerRepo(labSshService, lab.id);
  }
}
