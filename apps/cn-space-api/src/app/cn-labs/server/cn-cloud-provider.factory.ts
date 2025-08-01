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
        throw new BlBadRequestException(`Cloud provider ${cloudProvider} not supported`);
    }
  }
}
