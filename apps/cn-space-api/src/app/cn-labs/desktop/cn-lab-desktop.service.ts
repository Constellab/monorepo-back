import { Injectable } from '@nestjs/common';

import { CnCoreConfigService } from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnLabManagerInitConfig } from '../../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLab, CnLabWithSpace } from '../cn-lab.entity';
import { CnLabManagerService } from '../cn-lab-manager.service';
import { CnLabDesktopGenerateConfig } from './cn-lab-desktop.class';

@Injectable()
export class CnLabDesktopService {
  // list of volume to create
  private static readonly VOLUMES = {
    'lab-manager-config': '/app/conf',
    'lab-manager-biota': '/app/gws_db/gws_biota/mariadb',
    'lab-manager-prod-db': '/app/gws_db/gws_core/prod/mariadb',
    'lab-manager-dev-db': '/app/gws_db/gws_core/dev/mariadb',
    'lab-manager-prod-lab': '/app/prod/lab',
    'lab-manager-prod-data': '/app/prod/data',
    'lab-manager-dev-lab': '/app/dev/lab',
    'lab-manager-dev-data': '/app/dev/data',
  };

  private static readonly NETWORKS = ['gencovery-network-prod', 'gencovery-network-dev'];

  private static readonly CONTAINER_PORT = 3080;
  private static readonly LAB_MANAGER_IMAGE = 'constellab/lab-manager:latest';
  private static readonly LAB_MANAGER_STANDALONE_FRONT_IMAGE = 'constellab/lab-manager-standalone:latest';
  private static readonly CONTAINER_NAME = 'lab_manager';

  constructor(
    private labManagerService: CnLabManagerService,
    private coreConfigService: CnCoreConfigService
  ) {}

  public generateLabManagerConfig(
    lab: CnLabWithSpace,
    customConfig: CnLabDesktopGenerateConfig
  ): CnLabManagerInitConfig {
    const config = this.labManagerService.getLabManagerInitConfig(lab, lab.space.domain);
    config.openaiApiKey = customConfig.openaiApiKey;
    return config;
  }

  /**
   * Get the command to start the lab manager container
   */
  public getCreateAndRunLabManagerCommand(lab: CnLab): string {
    // command to create the volumes
    const volumes = Object.keys(CnLabDesktopService.VOLUMES)
      .map((volume) => `docker volume create ${volume}`)
      .join('\n');

    const networks = CnLabDesktopService.NETWORKS.map(
      (network) => `docker network create -d bridge ${network}`
    ).join('\n');

    return volumes + '\n' + networks + '\n' + this.getRunLabManagerCommand(lab);
  }

  public getUpdateAndRunLabManagerCommand(lab: CnLab): string {
    return (
      `docker pull ${CnLabDesktopService.LAB_MANAGER_IMAGE}\n` +
      `docker pull ${CnLabDesktopService.LAB_MANAGER_STANDALONE_FRONT_IMAGE}\n` +
      `docker rm -f ${CnLabDesktopService.CONTAINER_NAME}\n` +
      this.getRunLabManagerCommand(lab)
    );
  }

  private getRunLabManagerCommand(lab: CnLab): string {
    // volume usage in the run command
    const volumesUsage = Object.entries(CnLabDesktopService.VOLUMES)
      .map(([volume, path]) => ` -v ${volume}:${path}`)
      .join(' ');

    // network usage in the run command
    const networksUsage = CnLabDesktopService.NETWORKS.map((network) => ` --network ${network}`).join('');

    // command to start the container
    return (
      `docker run -d --name ${CnLabDesktopService.CONTAINER_NAME}` +
      networksUsage +
      ` -e ENVIRONMENT_PROFILE=desktop` +
      ` -e LAB_MANAGER_API_KEY=${lab.labManagerApiKey}` +
      ` -e LAB_NAME=${lab.name}` +
      ` -e LAB_ID=${lab.id}` +
      ` -e DESKTOP_COMMUNITY_API_URL=${this.coreConfigService.getCommunityApiUrl()}` +
      ` -e DESKTOP_COMMUNITY_FRONT_URL=${this.coreConfigService.getCommunityFrontUrl()}` +
      ` -e VOLUME_PATH=/app/conf` +
      ` -e LAB_AUTO_START=true` +
      ` -e LAB_MANAGER_STANDALONE_FRONT_VERSION=` +
      this.coreConfigService.getLabManagerStandaloneFrontVersion() +
      volumesUsage +
      // mount the docker socket to be able to run docker command in the container
      ` -v /var/run/docker.sock:/var/run/docker.sock` +
      ` -p ${CnLabDesktopService.CONTAINER_PORT}:${CnLabDesktopService.CONTAINER_PORT}` +
      ` constellab/lab-manager:latest`
    );
  }
}
