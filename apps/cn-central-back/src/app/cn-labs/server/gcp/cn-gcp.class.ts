import { ClHelpService } from '@monorepo/core-lib';
import { CnCpInstance, CnCpInstanceStatus, CnCpInstanceStatusObject } from '../cn-cloud-provider.class';
import { Logger } from '@nestjs/common';
import { CnLabBillingMode } from '../../cn-lab.entity';
import { google } from '@google-cloud/compute/build/protos/protos';
import IInstance = google.cloud.compute.v1.IInstance;

export type CnGcpInstanceStatus =
  | 'PROVISIONING'
  | 'STAGING'
  | 'RUNNING'
  | 'STOPPING'
  | 'STOPPED'
  | 'SUSPENDING'
  | 'SUSPENDED'
  | 'TERMINATED'
  | 'REPAIRING';

export class CnGcpInstance {
  private readonly logger = new Logger(CnGcpInstance.name);

  constructor(public instance: IInstance) {}

  get name(): string {
    return this.instance.name;
  }

  get id(): string {
    return this.instance.name;
  }

  get location(): string {
    return this.instance.zone;
  }

  public toStandardInstance(): CnCpInstance {
    return {
      id: this.id,
      status: this.getStandardStatus(),
      originalObject: this.instance,
      region: this.location,
      billing: CnLabBillingMode.HOURLY,
    };
  }

  getStatus(): CnGcpInstanceStatus {
    return this.instance.status as CnGcpInstanceStatus;
  }

  getStandardStatus(): CnCpInstanceStatusObject {
    try {
      const status = this.getStatus();
      return {
        status: this.gcpInstanceStatusToCpStatus(status),
        message: status,
      };
    } catch (error: any) {
      // TODO Text error.message
      this.logger.error(`Error getting GCP instance status: ${error.message}`);
      return {
        status: 'ERROR',
        message: error.message,
      };
    }
  }

  private gcpInstanceStatusToCpStatus(status: CnGcpInstanceStatus): CnCpInstanceStatus {
    switch (status) {
      case 'PROVISIONING':
      case 'STAGING':
        return 'CREATING';
      case 'RUNNING':
        return 'RUNNING';
      case 'STOPPED':
      case 'SUSPENDED':
      case 'TERMINATED':
        return 'STOPPED';
      case 'STOPPING':
      case 'SUSPENDING':
        return 'STOPPING';
      case 'REPAIRING':
      default:
        this.logger.error(`Unknown status ${status} for GCP instance ${this.name}`);
        return 'ERROR';
    }
  }

  async getNetworkId(): Promise<string> {
    const networkInterfaces = this.instance.networkInterfaces;
    if (ClHelpService.isNullOrEmpty(networkInterfaces)) {
      throw new Error('No network interfaces found for the GCP instance');
    }
    return networkInterfaces[0].name;
  }

  async getAttachedDisks(): Promise<string[]> {
    const disks = this.instance.disks;
    return disks
      .filter((disk) => disk.type !== 'PERSISTENT' || disk.boot !== true)
      .map((disk) => disk.deviceName);
  }

  async getOsDiskName(): Promise<string> {
    const disks = this.instance.disks;
    const osDisk = disks.find((disk) => disk.boot === true);
    return osDisk ? osDisk.deviceName : null;
  }
}

export type CnGcpVolumeStatus = 'CREATING' | 'READY' | 'FAILED' | 'RESTORING' | 'DELETING';
