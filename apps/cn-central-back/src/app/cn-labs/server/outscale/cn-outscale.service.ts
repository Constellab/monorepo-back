import { Configuration, PublicIp, PublicIpApi, TagApi, VmApi, VmState, Volume, VolumeApi } from 'outscale-api';
import { webcrypto } from 'crypto';
import { Vm } from 'outscale-api/dist/esm/models/Vm';
import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Logger } from '@nestjs/common';

// for the outscale api
Object.defineProperty(global, 'crypto', {
  value: webcrypto,
  writable: true,
  configurable: true
});

export class CnOutscaleService {

  private readonly logger = new Logger(CnOutscaleService.name);

  constructor(private region: string,
              private accessKeyId: string,
              private secretAccessKey: string) {
  }

  /////////////////////// INSTANCE ///////////////////////

  async createInstance(imageId: string, subRegion: string,
                       vmSize: string, sskKeyName: string,
                       securityGroupId: string): Promise<Vm> {
    const api = this.getVmApi();

    const response = await api.createVms({
      createVmsRequest: {
        imageId: imageId,
        vmType: vmSize,
        keypairName: sskKeyName,
        securityGroupIds: [securityGroupId],
        placement: {
          subregionName: subRegion
        },

      },
    }).catch((error) => {
      this.logger.error(error);
      throw new BlBadRequestException('Can\'t create the VM');
    });

    if (response.vms.length === 0) {
      throw new BlBadRequestException('Can\'t create the VM');
    }

    return response.vms[0];
  }

  async getVm(id: string): Promise<Vm | null> {
    const api = this.getVmApi();
    const response = await api.readVms({readVmsRequest: {filters: {vmIds: [id]}}})
      .catch((error) => {
        this.logger.error(error);
        throw new BlBadRequestException('Can\'t find the VM');
      });

    if (response.vms.length === 0) {
      throw new BlBadRequestException('Can\'t find the VM');
    }
    return response.vms[0];
  }

  public async deleteInstance(id: string): Promise<VmState> {
    const api = this.getVmApi();

    const response = await api.deleteVms({deleteVmsRequest: {vmIds: [id]}})
      .catch((error) => {
        this.logger.error(error);
        throw new BlBadRequestException('Can\'t delete the VM');
      });

    if (response.vms.length === 0) {
      throw new BlBadRequestException('Can\'t delete the VM');
    }

    return response.vms[0];
  }

  public async startInstance(id: string): Promise<VmState> {
    const api = this.getVmApi();

    const response = await api.startVms({startVmsRequest: {vmIds: [id]}})
      .catch((error) => {
        this.logger.error(error);
        throw new BlBadRequestException('Can\'t start the VM');
      });

    if (response.vms.length === 0) {
      throw new BlBadRequestException('Can\'t start the VM');
    }

    return response.vms[0];
  }

  public async stopInstance(id: string): Promise<VmState> {
    const api = this.getVmApi();

    const response = await api.stopVms({stopVmsRequest: {vmIds: [id]}})
      .catch((error) => {
        this.logger.error(error);
        throw new BlBadRequestException('Can\'t stop the VM');
      });

    if (response.vms.length === 0) {
      throw new BlBadRequestException('Can\'t stop the VM');
    }

    return response.vms[0];
  }

  private getVmApi(): VmApi {
    return new VmApi(this.getConfig());
  }

  ///////////////////////////////////// VOLUME /////////////////////////////////////

  public async createVolume(size: number, subRegion: string): Promise<Volume> {
    const api = this.getVolumeApi();

    const response = await api.createVolume({
      createVolumeRequest: {
        volumeType: 'standard',
        size: size,
        subregionName: subRegion
      }
    }).catch(
      (error) => {
        this.logger.error(error);
        throw new BlBadRequestException('Can\'t create the volume');
      });

    return response.volume;
  }

  public async getVolume(id: string): Promise<Volume> {
    const api = this.getVolumeApi();

    const response = await api.readVolumes(
      {readVolumesRequest: {filters: {volumeIds: [id]}}})
      .catch((error) => {
        this.logger.error(error);
        throw new BlBadRequestException('Can\'t find the volume');
      });

    if (response.volumes.length === 0) {
      throw new BlBadRequestException('Can\'t find the volume');
    }

    return response.volumes[0];
  }

  public async deleteVolume(id: string): Promise<void> {
    const api = this.getVolumeApi();

    await api.deleteVolume({deleteVolumeRequest: {volumeId: id}})
      .catch((error) => {
        this.logger.error(error);
        throw new BlBadRequestException('Can\'t delete the volume');
      });
  }

  public async attachVolumeToInstance(instanceId: string, volumeId: string): Promise<void> {
    const api = this.getVolumeApi();

    await api.linkVolume(
      {
        linkVolumeRequest: {
          volumeId: volumeId,
          vmId: instanceId,
          deviceName: '/dev/xvdb'
        }
      })
      .catch((error) => {
        this.logger.error(error);
        throw new BlBadRequestException('Can\'t attach the volume');
      });
  }

  private getVolumeApi(): VolumeApi {
    return new VolumeApi(this.getConfig());
  }


  ////////////////////////////////// IP ////////////////////////////////////
  public async createPublicIp(): Promise<PublicIp> {
    const api = this.getIpApi();

    const response = await api.createPublicIp()
      .catch((error) => {
        this.logger.error(error);
        throw new BlBadRequestException('Can\'t create the public IP');
      });

    return response.publicIp;
  }

  public async getPublicIpByInstance(id: string): Promise<PublicIp | null> {
    const api = this.getIpApi();

    const response = await api.readPublicIps(
      {readPublicIpsRequest: {filters: {vmIds: [id]}}})
      .catch((error) => {
        this.logger.error(error);
        throw new BlBadRequestException('Can\'t find the public IP');
      });

    if (response.publicIps.length === 0) {
      return null;
    }

    return response.publicIps[0];
  }

  public async deletePublicIp(id: string): Promise<void> {
    const api = this.getIpApi();

    await api.deletePublicIp({deletePublicIpRequest: {publicIpId: id}})
      .catch((error) => {
        this.logger.error(error);
        throw new BlBadRequestException('Can\'t delete the public IP');
      });
  }

  private getIpApi(): PublicIpApi {
    return new PublicIpApi(this.getConfig());
  }


  /////////////////////////////////// TAG ///////////////////////////////////

  public async updateObjectName(id: string, name: string): Promise<void> {
    await this.updateObjectTag(id, 'Name', name)
      .catch((error) => {
        this.logger.error(error);
        throw new BlBadRequestException('Can\'t update the name');
      });
  }

  public async updateObjectTag(id: string, key: string, value: string): Promise<void> {
    const api = this.getTagApi();

    await api.createTags(
      {
        createTagsRequest: {
          resourceIds: [id],
          tags: [{key: key, value: value}]
        }
      }
    ).catch((error) => {
      this.logger.error(error);
      throw new BlBadRequestException('Can\'t update the tag');
    });
  }

  private getTagApi(): TagApi {
    return new TagApi(this.getConfig());
  }

  /////////////////////////////////// OTHER ///////////////////////////////////


  private getConfig(): Configuration {
    return new Configuration({
      basePath: 'https://api.' + this.region + '.outscale.com/api/v1',
      awsV4SignParameters: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
        service: 'api',
        region: this.region,
      }
    });
  }

}
