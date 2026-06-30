import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';

import { CnCloudProviderName } from '../../cn-cloud-providers/cn-cloud-provider.entity';
import { CnLab } from '../cn-lab.entity';
import { CnLabsService } from '../cn-labs.service';
import { CnCloudProviderAzureService } from './azure/cn-cloud-provider-azure.service';
import { CnCloudProviderService } from './cn-cloud-provider.service';
import { CnLabSshService } from './cn-lab-ssh.service';
import { CnCloudProviderGcpService } from './gcp/cn-cloud-provider-gcp.service';
import { CnCloudProviderOutscaleService } from './outscale/cn-cloud-provider-outscale.service';
import { CnCloudProviderOvhService } from './ovh/cn-cloud-provider-ovh.service';

@Injectable()
export class CnCloudProviderFactory {
  private readonly logger = new Logger(CnCloudProviderFactory.name);

  constructor(
    private ovhCloudProviderService: CnCloudProviderOvhService,
    private azureCloudProviderService: CnCloudProviderAzureService,
    private outscaleCloudProviderService: CnCloudProviderOutscaleService,
    private gcpCloudProviderService: CnCloudProviderGcpService,
    private labsService: CnLabsService
  ) {}

  public async getSshLabService(lab: CnLab): Promise<CnLabSshService> {
    const cloudProviderService = await this.getCloudProviderServiceFromLab(lab.id);

    return cloudProviderService.instantiateLabSshService(lab);
  }

  /**
   * Build an ssh service that connects directly to the server's IP address
   * instead of resolving the lab virtual host through DNS. Use this during
   * server bootstrap, before DNS has propagated, so DNS propagation is not on
   * the critical path. Falls back to a DNS-based ssh service if the IP can't be
   * resolved.
   */
  public async getSshLabServiceByIp(lab: CnLab): Promise<CnLabSshService> {
    const cloudProviderService = await this.getCloudProviderServiceFromLab(lab.id);
    const ipAddress = await this.tryGetServerIpAddress(lab);
    return cloudProviderService.instantiateLabSshService(lab, ipAddress);
  }

  /**
   * Resolve the IP address of the lab's server. If a manual IP override is set
   * on the lab (e.g. on-premise labs only reachable on the client network), it
   * takes precedence. Otherwise, for cloud labs, the IP is fetched from the
   * cloud provider. Returns undefined if it can't be determined (no override,
   * not a cloud lab, no instance yet, or a provider error). Never throws.
   */
  public async tryGetServerIpAddress(lab: CnLab): Promise<string | undefined> {
    // a manual override always wins (on-premise labs, custom routing)
    if (lab.labIpOverride) {
      return lab.labIpOverride;
    }

    // only cloud labs have an IP we can fetch from a cloud provider
    if (!lab.isCloud()) {
      return undefined;
    }

    try {
      if (!lab.serverInstanceId) {
        return undefined;
      }
      const cloudProviderService = await this.getCloudProviderServiceFromLab(lab.id);
      return await cloudProviderService.getIpAddressFromInstanceId(
        lab.serverInstanceId,
        lab.region.technicalName
      );
    } catch (error: any) {
      this.logger.warn(
        `Could not resolve IP address for lab ${lab.id}. ` +
          `Error: ${error instanceof Error ? error.message : error}`
      );
      return undefined;
    }
  }

  public async getCloudProviderServiceFromLab(labId: string): Promise<CnCloudProviderService> {
    const server = await this.labsService.getLabServerCloud(labId);

    return this.getCloudProviderService(server.cloudProvider.name);
  }

  public getCloudProviderService(cloudProvider: CnCloudProviderName): CnCloudProviderService {
    switch (cloudProvider) {
      case 'OVH':
        this.logger.debug('Using OVH cloud provider service');
        return this.ovhCloudProviderService;
      case 'AZURE':
        this.logger.debug('Using AZURE cloud provider service');
        return this.azureCloudProviderService;
      case 'OUTSCALE':
        this.logger.debug('Using OUTSCALE cloud provider service');
        return this.outscaleCloudProviderService;
      case 'GCP':
        this.logger.debug('Using GCP cloud provider service');
        return this.gcpCloudProviderService;
      default:
        throw new BlBadRequestException(`Cloud provider ${cloudProvider as any} not supported`);
    }
  }
}
