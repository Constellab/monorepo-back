import {Injectable} from '@nestjs/common';
import {CnCloudProviderName} from '../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnCloudProviderService} from './cn-cloud-provider.service';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {CnCloudProviderOvhService} from './ovh/cn-cloud-provider-ovh.service';
import {CnCloudProviderAzureService} from './azure/cn-cloud-provider-azure.service';
import {CnLabSshService} from './cn-lab-ssh.service';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnCloudProviderOutscaleService} from './outscale/cn-cloud-provider-outscale.service';


@Injectable()
export class CnCloudProviderFactory {

  constructor(private ovhCloudProviderService: CnCloudProviderOvhService,
              private azureCloudProviderService: CnCloudProviderAzureService,
              private outscaleCloudProviderService: CnCloudProviderOutscaleService) {
  }

  public getSshLabService(labInstance: CnLabInstance): CnLabSshService {
    const cloudProviderService = this.getCloudProviderService(labInstance.getCloudProviderName());

    return cloudProviderService.instantiateLabSshService(labInstance);
  }


  public getCloudProviderService(cloudProvider: CnCloudProviderName): CnCloudProviderService {
    switch (cloudProvider) {
      case 'OVH':
        return this.ovhCloudProviderService;
      case 'AZURE':
        return this.azureCloudProviderService;
      case 'OUTSCALE':
        return this.outscaleCloudProviderService;
      default:
        throw new BlBadRequestException(`Cloud provider ${cloudProvider} not supported`);
    }
  }
}
