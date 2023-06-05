import {Injectable} from '@nestjs/common';
import {CnCloudProviderName} from '../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnCloudProviderService} from './cn-cloud-provider.service';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {CnCloudProviderOvhService} from './ovh/cn-cloud-provider-ovh.service';
import {CnCloudProviderAzureService} from './azure/cn-cloud-provider-azure.service';


@Injectable()
export class CnCloudProviderFactory {

  constructor(private ovhCloudProviderService: CnCloudProviderOvhService,
              private azureCloudProviderService: CnCloudProviderAzureService) {
  }


  public getCloudProviderService(cloudProvider: CnCloudProviderName): CnCloudProviderService {
    switch (cloudProvider) {
      case 'OVH':
        return this.ovhCloudProviderService;
      case 'AZURE':
        return this.azureCloudProviderService;
      default:
        throw new BlBadRequestException(`Cloud provider ${cloudProvider} not supported`);
    }
  }
}
