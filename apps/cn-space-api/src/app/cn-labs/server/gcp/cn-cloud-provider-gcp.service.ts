import { Injectable } from '@nestjs/common';

import { CnCloudProviderName } from '../../../cn-cloud-providers/cn-cloud-provider.entity';
import { CnCoreConfigService } from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCommandService } from '../../../cn-core/services/cn-command.service';
import {
  CN_SERVER_UBUNTU_USER,
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpInstanceWithVolume,
  CnCpVolume,
} from '../cn-cloud-provider.class';
import { CnCloudProviderService } from '../cn-cloud-provider.service';
import { CnGcpHelper } from './cn-gcp.class';
import { CnGcpService } from './cn-gcp.service';

/**
 * GCP Cloud Provider
 * The Constellab region corresponds to the GCP zone (e.g. europe-west1-b)
 * The GCP region is the parent of the zone (e.g. europe-west1)
 */
@Injectable()
export class CnCloudProviderGcpService extends CnCloudProviderService {
  // Ubuntu 22.04 LTS on GCP
  private static IMAGE_FAMILY = 'ubuntu-2204-lts';
  private static IMAGE_PROJECT = 'ubuntu-os-cloud';

  private static DISK_ARCHITECTURE = 'X86_64';
  private static SUB_NETWORK_NAME = 'default';

  constructor(
    private gcpService: CnGcpService,
    configService: CnCoreConfigService,
    commandService: CnCommandService
  ) {
    super(commandService, configService);
  }

  getName(): CnCloudProviderName {
    return 'GCP';
  }

  getSshPrivateKeyFilePath(): string {
    return this.configService.getGcpSshPrivateKeyFilePath();
  }

  getSshUserName(): string {
    return CN_SERVER_UBUNTU_USER;
  }

  /////////////////////// INSTANCE ///////////////////////
  createInstance(): Promise<CnCpInstance> {
    // this is not called as the volume is created the same time as the instance
    // with this we only create 1 volume in GCP
    throw new Error('Not implemented');
  }

  async createInstanceWithVolume(
    instanceRequest: CnCpCreateInstanceRequest,
    volumeRequest: CnCpCreateVolumeRequest
  ): Promise<CnCpInstanceWithVolume> {
    const instanceName = this.getGCPInstanceName(instanceRequest.name);

    const instance = await this.gcpService.createInstanceAndVolume({
      name: instanceName,
      zone: instanceRequest.region,
      machineType: instanceRequest.serverName,
      imageFamily: CnCloudProviderGcpService.IMAGE_FAMILY,
      imageProject: CnCloudProviderGcpService.IMAGE_PROJECT,
      staticIp: instanceRequest.ipAddress?.ipAddress,
      subnetName: CnCloudProviderGcpService.SUB_NETWORK_NAME,
      volumeSizeGb: volumeRequest.size,
      volumeArchitecture: CnCloudProviderGcpService.DISK_ARCHITECTURE,
      // provide the firewall config for the ports
      tags: [this.configService.getGcpFirewallTag()],
    });

    const volume = await this.getVolume(instance.mainVolumeName, instanceRequest.region);

    return {
      instance: instance.toStandardInstance(),
      volume: volume,
    };
  }

  async deleteInstance(id: string, region: string): Promise<void> {
    // Delete the instance
    await this.gcpService.deleteInstance(id, region);
  }

  async getInstance(id: string, region: string): Promise<CnCpInstance> {
    const instance = await this.gcpService.getInstance(id, region);
    return instance.toStandardInstance();
  }

  async startInstance(id: string, region: string): Promise<void> {
    await this.gcpService.startInstance(id, region);
  }

  async stopInstance(id: string, region: string): Promise<void> {
    await this.gcpService.stopInstance(id, region);
  }

  /////////////////////// VOLUME ///////////////////////

  volumeIsCreatedSeparately(): boolean {
    return false;
  }

  attachVolumeToInstance(): Promise<CnCpVolume> {
    // as the volume is created with the instance, we don't need to create it separately
    throw Error('Not implemented');
  }

  createVolume(): Promise<CnCpVolume> {
    // as the volume is created with the instance, we don't need to create it separately
    throw Error('Not implemented');
  }

  async deleteVolume(volumeId: string, region: string): Promise<void> {
    await this.gcpService.deleteVolume(volumeId, region);
  }

  async getVolume(volumeId: string, region: string): Promise<CnCpVolume> {
    const volume = await this.gcpService.getVolume(volumeId, region);
    return volume.toStandardVolume();
  }

  async volumeIsAttachedToInstance(instanceId: string, volumeId: string, region: string): Promise<boolean> {
    const instance = await this.gcpService.getInstance(instanceId, region);
    const volume = await this.gcpService.getVolume(volumeId, region);
    return instance.isAttachedToVolume(volume.selfLink);
  }

  mountVolume(): Promise<void> {
    // no need to mount the volume as the volume is already mounted
    // because the volume is created with the instance
    return null;
  }

  ///////////////////////////////////// IP ADDRESS ///////////////////////////////////////

  async getIpAddressFromInstanceId(id: string, region: string): Promise<string> {
    return await this.gcpService.getIpAddressFromInstance(id, region);
  }

  async deleteIpAddress(ipAddressId: string, region: string): Promise<void> {
    const gcpRegion = CnGcpHelper.getRegionNameFromZoneName(region);
    return this.gcpService.deleteStaticIpAddress(ipAddressId, gcpRegion);
  }

  /////////////////////////////////////// OTHER ////////////////////////////////////////
  /**
   * Get the GCP instance name from the Constellab instance name
   * we set instance name to vm-<name> because GCP must start with a letter
   * @param instanceName
   * @private
   */
  private getGCPInstanceName(instanceName: string): string {
    return `vm-${instanceName}`;
  }
}
