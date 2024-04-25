import {Injectable, Logger} from '@nestjs/common';
import {CnCloudProviderName} from '../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnCloudProviderService} from './cn-cloud-provider.service';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {CnCloudProviderOvhService} from './ovh/cn-cloud-provider-ovh.service';
import {CnCloudProviderAzureService} from './azure/cn-cloud-provider-azure.service';
import {CnLabSshService} from './cn-lab-ssh.service';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnCloudProviderOutscaleService} from './outscale/cn-cloud-provider-outscale.service';
import {CnLabInstancesService} from '../cn-lab-instances.service';


@Injectable()
export class CnCloudProviderFactory {

  private readonly logger = new Logger(CnCloudProviderFactory.name);


  constructor(private ovhCloudProviderService: CnCloudProviderOvhService,
              private azureCloudProviderService: CnCloudProviderAzureService,
              private outscaleCloudProviderService: CnCloudProviderOutscaleService,
              private labInstancesService: CnLabInstancesService) {
  }

  public async getSshLabService(labInstance: CnLabInstance): Promise<CnLabSshService> {
    const cloudProviderService = await this.getCloudProviderServiceFromLab(labInstance.id);

    return cloudProviderService.instantiateLabSshService(labInstance);
  }


  public async getCloudProviderServiceFromLab(labInstanceId: string): Promise<CnCloudProviderService> {
    const server = await this.labInstancesService.getLabServerCloud(labInstanceId);

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
      default:
        throw new BlBadRequestException(`Cloud provider ${cloudProvider} not supported`);
    }
  }
}
