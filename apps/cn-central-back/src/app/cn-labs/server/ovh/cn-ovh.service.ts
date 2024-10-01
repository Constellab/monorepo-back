import {
  CnDomainFieldType,
  CnOvhAttachVolumeRequest,
  CnOvhCreateDomainRecordRequest,
  CnOvhCreateInstanceRequest,
  CnOvhCreateVolumeRequest,
  CnOvhDomainRecord,
  CnOvhFlavor,
  CnOvhImage,
  CnOvhInstance,
  CnOvhVolume
} from './cn-ovh.class';
import { CnCoreConfigService } from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import { Injectable, Logger } from '@nestjs/common';
import { BlBadRequestException } from '@monorepo/back-core-lib';
import { cnServerUbuntuUser } from '../cn-cloud-provider.class';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ovh = require('ovh');


interface CnOvh {
  requestPromised(methode: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: any): Promise<any>;
}


@Injectable()
export class CnOvhService {
  // to test ovh api, generate a token here : https://eu.api.ovh.com/createToken/, set all request type with '/*'
  // then update dev env

  private ovh: CnOvh;
  private serviceName: string;

  private readonly logger = new Logger(CnOvhService.name);


  constructor(private configService: CnCoreConfigService) {
    this.initOvh();
  }

  ////////////////////////////////// INSTANCE //////////////////////////////////

  public async createInstance(request: CnOvhCreateInstanceRequest): Promise<CnOvhInstance> {
    return await this.requestPromised('POST', `/cloud/project/${this.serviceName}/instance`, request);
  }

  public getInstance(instanceId: string): Promise<CnOvhInstance> {
    return this.requestPromised('GET', `/cloud/project/${this.serviceName}/instance/${instanceId}`);
  }


  public async getServerInfoByRegionAndName(region: string, name: string): Promise<CnOvhFlavor | null> {
    const flavors: CnOvhFlavor[] = await this.requestPromised('GET', `/cloud/project/${this.serviceName}/flavor`, {
      region: region,
    });

    return flavors.find((flavor) => flavor.name === name && flavor.available && flavor.osType === 'linux');
  }

  public async getImageByRegionAndName(region: string, name: string): Promise<CnOvhImage | null> {
    const images: CnOvhImage[] = await this.requestPromised('GET', `/cloud/project/${this.serviceName}/image`, {
      region: region,
    });

    return images.find((image) => image.name === name && image.status === 'active' && image.type === 'linux'
      && image.user === cnServerUbuntuUser);
  }

  public async deleteInstance(instanceId: string): Promise<any> {
    return await this.requestPromised('DELETE', `/cloud/project/${this.serviceName}/instance/${instanceId}`);
  }

  ////////////////////////////////// START & STOP //////////////////////////////////

  public async stopInstance(instanceId: string): Promise<any> {
    return await this.requestPromised('POST', `/cloud/project/${this.serviceName}/instance/${instanceId}/shelve`);
  }

  public async startInstance(instanceId: string): Promise<any> {
    return await this.requestPromised('POST', `/cloud/project/${this.serviceName}/instance/${instanceId}/unshelve`);
  }

  ///////////////////////////////////////// VOLUME /////////////////////////////////////////

  public async createVolume(request: CnOvhCreateVolumeRequest): Promise<CnOvhVolume> {
    return await this.requestPromised('POST', `/cloud/project/${this.serviceName}/volume`, request);
  }


  public async attachVolumeToInstance(instanceId: string, volumeId: string): Promise<CnOvhVolume> {
    const request: CnOvhAttachVolumeRequest = {
      instanceId: instanceId,
    };

    const route = `/cloud/project/${this.serviceName}/volume/${volumeId}/attach`;

    try {
      return await this.requestPromised('POST', route, request);
    } catch (e) {
      // when attaching failed, retry in 30s because OVH tells volume is ready but it's not
      this.logger.error(`Error while attaching volume ${volumeId} to instance ${instanceId}, retrying in 45s. Error: ${e.toString()}`);
      await new Promise(r => setTimeout(r, 45000));
      return await this.requestPromised('POST', route, request);
    }
  }

  public async getVolume(volumeId: string): Promise<CnOvhVolume> {
    return await this.requestPromised('GET', `/cloud/project/${this.serviceName}/volume/${volumeId}`);
  }

  public async deleteVolume(volumeId: string): Promise<any> {
    return await this.requestPromised('DELETE', `/cloud/project/${this.serviceName}/volume/${volumeId}`);
  }


  /////////////////////////////// DNS ///////////////////////////////


  public async createDomainRecord(domain: string, request: CnOvhCreateDomainRecordRequest): Promise<CnOvhDomainRecord> {
    const response = await this.requestPromised('POST', `/domain/zone/${domain}/record`, request);

    try {
      await this.refreshDns(domain);

    } catch (e: any) {
      // if the error contains an error attribute between 200 and 300, we consider
      // that the error is not blocking (it happens during creation sometimes)
      if (!e.error || e.error < 200 || e.error >= 300) {
        throw e;
      }
      this.logger.log('Skipping error while refreshing DNS after record creation');
    }

    return response;
  }

  public getDomainRecordIdBySubDomain(domain: string, subDomain: string, type: CnDomainFieldType): Promise<number[]> {
    return this.requestPromised('GET', `/domain/zone/${domain}/record`, {
      fieldType: type,
      subDomain: subDomain,
    });
  }

  public async domainRecordExist(domain: string, subDomain: string, type: CnDomainFieldType): Promise<boolean> {
    const records: number[] = await this.getDomainRecordIdBySubDomain(domain, subDomain, type);

    return records.length > 0;
  }

  public async deleteDomainRecord(domain: string, recordId: number): Promise<void> {
    await this.requestPromised('DELETE', `/domain/zone/${domain}/record/${recordId}`);
    await this.refreshDns(domain);
  }

  public getDomainRecord(domain: string, recordId: number): Promise<CnOvhDomainRecord> {
    return this.requestPromised('GET', `/domain/zone/${domain}/record/${recordId}`);
  }

  private async refreshDns(domain: string): Promise<void> {
    // apply modifications
    await this.requestPromised('POST', `/domain/zone/${domain}/refresh`);
  }

  //////////////////////////// OTHER ////////////////////////////
  private requestPromised(method: 'GET' | 'POST' | 'PUT' | 'DELETE', route: string, body?: any): Promise<any> {
    return this.ovh.requestPromised(method, route, body).catch((e) => {
      let strError: string;
      if (e.message) {
        strError = e.message;
      } else if (typeof e === 'object') {
        strError = JSON.stringify(e);
      } else {
        strError = e.toString();
      }
      this.logger.error(`Error while calling OVH API route : ${route} | Method : ${method} | Error : ${strError}`);
      throw new BlBadRequestException(strError);
    });
  }


  private initOvh(): void {
    this.ovh = ovh({
      appKey: this.configService.getOvhAppKey(),
      appSecret: this.configService.getOvhAppSecret(),
      consumerKey: this.configService.getOvhConsumerKey(),
    });
    this.serviceName = this.configService.getOvhServiceName();
  }
}
