import { Injectable } from '@nestjs/common';
import { CnCloudProviderService } from '../cn-cloud-provider.service';
import { CnCloudProviderName } from '../../../cn-cloud-providers/cn-cloud-provider.entity';
import {
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpVolume,
  CnCpVolumeStatus,
} from '../cn-cloud-provider.class';
import { CnGcpService } from './cn-gcp.service';
import { CnLab } from '../../cn-lab.entity';
import { CnGcpInstance, CnGcpVolumeStatus } from './cn-gcp.class';
import { CnCoreConfigService } from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCommandService } from '../../../cn-core/services/cn-command.service';
import { CnLabVolumeType } from '../../volume/cn-lab-volume-entity';
import * as path from 'path';
import { google } from '@google-cloud/compute/build/protos/protos';
import IDisk = google.cloud.compute.v1.IDisk;

@Injectable()
export class CnCloudProviderGcpService extends CnCloudProviderService {
  private static MOUNT_FILE = 'mount_gcp.sh';
  private static SSH_KEY_FILE_NAME = 'id_rsa';

  // Ubuntu 22.04 LTS on GCP
  private static IMAGE_FAMILY = 'ubuntu-2204-lts';
  private static IMAGE_PROJECT = 'ubuntu-os-cloud';

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

  getSshKeyFileName(): string {
    return CnCloudProviderGcpService.SSH_KEY_FILE_NAME;
  }

  getSshUserName(): string {
    return 'ubuntu';
  }

  /////////////////////// INSTANCE ///////////////////////
  async createInstance(request: CnCpCreateInstanceRequest): Promise<CnCpInstance> {
    const sshPublicKeyPath = path.join(
      this.configService.getGcpKeysFolder(),
      `${CnCloudProviderGcpService.SSH_KEY_FILE_NAME}.pub`
    );

    const vm = await this.gcpService.createInstance(
      request.name,
      request.region,
      request.serverName,
      CnCloudProviderGcpService.IMAGE_FAMILY,
      CnCloudProviderGcpService.IMAGE_PROJECT,
      sshPublicKeyPath,
      this.configService.getGcpNetwork(),
      this.configService.getGcpSubnetwork()
    );

    const instance = new CnGcpInstance(vm);
    return instance.toStandardInstance();
  }

  async deleteInstance(id: string): Promise<void> {
    const instance = await this.getGcpInstance(id);
    // Extract zone from the instance metadata
    const zoneName = instance.instance.zone;

    // Delete the instance
    await this.gcpService.deleteInstance(id, zoneName);
  }

  async getInstance(id: string): Promise<CnCpInstance> {
    const instance = await this.getGcpInstance(id);
    return instance.toStandardInstance();
  }

  private async getGcpInstance(id: string): Promise<CnGcpInstance> {
    // Since GCP requires zone information to get an instance,
    // we either need to know the zone or search across all zones
    // For simplicity, assuming zone is stored in configuration or derived from region
    const zone = this.configService.getGcpDefaultZone();
    const vm = await this.gcpService.getInstance(id, zone);
    return new CnGcpInstance(vm);
  }

  async startInstance(id: string): Promise<void> {
    const instance = await this.getGcpInstance(id);
    const zoneName = instance.instance.zone;

    await this.gcpService.startInstance(id, zoneName);
  }

  async stopInstance(id: string): Promise<void> {
    const instance = await this.getGcpInstance(id);
    const zoneName = instance.instance.zone;

    await this.gcpService.stopInstance(id, zoneName);
  }

  async getIpAddress(id: string): Promise<string> {
    const instance = await this.getGcpInstance(id);
    const zoneName = instance.instance.zone;

    return this.gcpService.getIpAddress(id, zoneName);
  }

  /////////////////////// VOLUME ///////////////////////

  async attachVolumeToInstance(instanceId: string, volumeId: string): Promise<CnCpVolume> {
    const instance = await this.getGcpInstance(instanceId);
    const zoneName = instance.instance.zone;

    await this.gcpService.attachVolume(instanceId, volumeId, zoneName);
    return this.getVolume(volumeId);
  }

  async createVolume(volume: CnCpCreateVolumeRequest): Promise<CnCpVolume> {
    // Assuming zone is derived from region or stored in configuration
    const zone = this.configService.getGcpDefaultZone();
    const disk = await this.gcpService.createVolume(volume.name, zone, volume.size);

    return this.convertGcpVolume(disk, zone);
  }

  async deleteVolume(volumeId: string): Promise<void> {
    // Need to know the zone where the volume is located
    const zone = this.configService.getGcpDefaultZone();
    await this.gcpService.deleteVolume(volumeId, zone);
  }

  async getVolume(volumeId: string): Promise<CnCpVolume> {
    const zone = this.configService.getGcpDefaultZone();
    const disk = await this.gcpService.getVolume(volumeId, zone);
    return this.convertGcpVolume(disk, zone);
  }

  async volumeIsAttachedToInstance(instanceId: string, volumeId: string): Promise<boolean> {
    const instance = await this.getGcpInstance(instanceId);
    const attachedDisks = await instance.getAttachedDisks();
    return attachedDisks.includes(volumeId);
  }

  async mountVolume(lab: CnLab): Promise<void> {
    const gcpInstance = await this.getGcpInstance(lab.serverInstanceId);
    const attachedDisks = await gcpInstance.getAttachedDisks();

    if (attachedDisks.length === 0) {
      throw new Error(`No volume attached to instance ${lab.serverInstanceId}`);
    }

    const labSshService = this.instantiateLabSshService(lab);
    const mountScript = labSshService.getMountFolder() + '/' + CnCloudProviderGcpService.MOUNT_FILE;

    // In GCP, the device name is typically like /dev/sdb, /dev/sdc, etc.
    // The script should handle identifying and mounting the correct device
    await labSshService.execSshCommand([`bash ${mountScript}`]);
  }

  private convertGcpVolume(disk: IDisk, zone: string): CnCpVolume {
    return {
      region: zone,
      status: this.gcpVolumeStatusToCpStatus(disk.status as CnGcpVolumeStatus),
      type: CnLabVolumeType.HIGH_SPEED,
      // TODO a voir
      size: parseInt(disk.sizeGb.toString(), 10),
      id: disk.name,
      originalObject: disk,
    };
  }

  private gcpVolumeStatusToCpStatus(status: CnGcpVolumeStatus): CnCpVolumeStatus {
    switch (status) {
      case 'READY':
        return 'AVAILABLE';
      case 'CREATING':
        return 'CREATING';
      case 'RESTORING':
      case 'DELETING':
        // TODO a voir
        return 'ATTACHING';
      case 'FAILED':
      default:
        throw new Error(`Unknown status ${status} for GCP disk`);
    }
  }
}
