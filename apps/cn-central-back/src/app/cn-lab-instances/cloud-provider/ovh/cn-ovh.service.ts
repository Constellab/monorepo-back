import {
  CnDomainFieldType,
  CnOvhAttachVolumeRequest,
  CnOvhCreateDomainRecordRequest,
  CnOvhCreateDomainRecordResponse,
  CnOvhCreateInstanceRequest,
  CnOvhCreateVolumeRequest,
  CnOvhFlavor,
  CnOvhImage,
  CnOvhInstance,
  CnOvhVolume
} from './ovh.class';
import {CnCoreConfigService} from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import {Injectable} from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ovh = require('ovh');


interface CnOvh {
  requestPromised(methode: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: any): Promise<any>;
}


@Injectable()
export class CnOvhService {

  private static UBUNTU_USER = 'ubuntu';
  private ovh: CnOvh;
  private serviceName: string;

  constructor(private configService: CnCoreConfigService) {
    this.initOvh();
  }

  ////////////////////////////////// INSTANCE //////////////////////////////////

  public async createInstance(request: CnOvhCreateInstanceRequest): Promise<CnOvhInstance> {
    return await this.ovh.requestPromised('POST', `/cloud/project/${this.serviceName}/instance`, request);
  }

  public getInstance(instanceId: string): Promise<CnOvhInstance> {
    return this.ovh.requestPromised('GET', `/cloud/project/${this.serviceName}/instance/${instanceId}`);
  }


  public async getServerInfoByRegionAndName(region: string, name: string): Promise<CnOvhFlavor | null> {
    const flavors: CnOvhFlavor[] = await this.ovh.requestPromised('GET', `/cloud/project/${this.serviceName}/flavor`, {
      region: region,
    });

    return flavors.find((flavor) => flavor.name === name && flavor.available && flavor.osType === 'linux');
  }

  public async getImageByRegionAndName(region: string, name: string): Promise<CnOvhImage | null> {
    const images: CnOvhImage[] = await this.ovh.requestPromised('GET', `/cloud/project/${this.serviceName}/image`, {
      region: region,
    });

    return images.find((image) => image.name === name && image.status === 'active' && image.type === 'linux'
      && image.user === CnOvhService.UBUNTU_USER);
  }

  public async deleteInstance(instanceId: string): Promise<any> {
    return await this.ovh.requestPromised('DELETE', `/cloud/project/${this.serviceName}/instance/${instanceId}`);
  }


  ///////////////////////////////////////// VOLUME /////////////////////////////////////////

  public async createVolume(request: CnOvhCreateVolumeRequest): Promise<CnOvhVolume> {
    return await this.ovh.requestPromised('POST', `/cloud/project/${this.serviceName}/volume`, request);
  }


  public async attachVolumeToInstance(instanceId: string, volumeId: string): Promise<CnOvhVolume> {
    const request: CnOvhAttachVolumeRequest = {
      instanceId: instanceId,
    };

    return await this.ovh.requestPromised('POST', `/cloud/project/${this.serviceName}/volume/${volumeId}/attach`, request);
  }

  public async getVolume(volumeId: string): Promise<CnOvhVolume> {
    return await this.ovh.requestPromised('GET', `/cloud/project/${this.serviceName}/volume/${volumeId}`);
  }

  public async deleteVolume(volumeId: string): Promise<any> {
    return await this.ovh.requestPromised('DELETE', `/cloud/project/${this.serviceName}/volume/${volumeId}`);
  }


  /////////////////////////////// DNS ///////////////////////////////


  public async createDomainRecord(domain: string, request: CnOvhCreateDomainRecordRequest): Promise<CnOvhCreateDomainRecordResponse> {
    const response = await this.ovh.requestPromised('POST', `/domain/zone/${domain}/record`, request);

    await this.refreshDns(domain);

    return response;
  }

  public getDomainRecordIdBySubDomain(domain: string, subDomain: string, type: CnDomainFieldType): Promise<number[]> {
    return this.ovh.requestPromised('GET', `/domain/zone/${domain}/record`, {
      fieldType: type,
      subDomain: subDomain,
    });
  }

  public async domainRecordExist(domain: string, subDomain: string, type: CnDomainFieldType): Promise<boolean> {
    const records: number[] = await this.getDomainRecordIdBySubDomain(domain, subDomain, type);

    return records.length > 0;
  }

  public async deleteDomainRecord(domain: string, recordId: number): Promise<void> {
    await this.ovh.requestPromised('DELETE', `/domain/zone/${domain}/record/${recordId}`);
    await this.refreshDns(domain);
  }

  private async refreshDns(domain: string): Promise<void> {
    // apply modifications
    await this.ovh.requestPromised('POST', `/domain/zone/${domain}/refresh`);
  }

  //////////////////////////// OTHER ////////////////////////////
  private initOvh(): void {
    this.ovh = ovh({
      appKey: this.configService.getOvhAppKey(),
      appSecret: this.configService.getOvhAppSecret(),
      consumerKey: this.configService.getOvhConsumerKey(),
    });
    this.serviceName = this.configService.getOvhServiceName();
  }
}
