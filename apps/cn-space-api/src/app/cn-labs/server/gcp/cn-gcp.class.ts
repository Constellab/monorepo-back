import { protos } from '@google-cloud/compute';
import { google } from '@google-cloud/compute/build/protos/protos';
import { Logger } from '@nestjs/common';

import { CnLabBillingMode } from '../../cn-lab.entity';
import { CnLabVolumeType } from '../../volume/cn-lab-volume-entity';
import {
  CnCpInstance,
  CnCpInstanceStatus,
  CnCpInstanceStatusObject,
  CnCpVolume,
  CnCpVolumeStatus,
} from '../cn-cloud-provider.class';

export class CnGcpHelper {
  /**
   * Extracts the region name from a GCP zone name.
   * For example, if the zone name is "us-central1-a", the region name will be "us-central1".
   * @param zoneName
   */
  public static getRegionNameFromZoneName(zoneName: string): string {
    const parts = zoneName.split('-');
    if (parts.length < 3) {
      throw new Error(`Invalid GCP zone name: ${zoneName}`);
    }
    return parts.slice(0, 2).join('-');
  }
}

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

  constructor(public instance: protos.google.cloud.compute.v1.IInstance) {}

  get name(): string {
    return this.instance.name;
  }

  get id(): string {
    return this.instance.name;
  }

  get location(): string {
    return this.instance.zone;
  }

  get networkInterfaces(): protos.google.cloud.compute.v1.INetworkInterface[] {
    return this.instance.networkInterfaces;
  }

  get mainVolumeName(): string {
    // the main disk name has the same name as the instance
    return this.instance.name;
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
    const status = this.getStatus();
    return {
      status: this.gcpInstanceStatusToCpStatus(status),
      message: status,
    };
  }

  private gcpInstanceStatusToCpStatus(status: CnGcpInstanceStatus): CnCpInstanceStatus {
    if (status == null) {
      this.logger.error(`GCP instance status is null for instance ${this.name}`);
      return 'CREATING';
    }
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

  isAttachedToVolume(diskLink: string): boolean {
    const disks = this.instance.disks;
    return disks.some((disk) => disk.source === diskLink);
  }
}

export class CnGcpVolume {
  private readonly logger = new Logger(CnGcpVolume.name);

  constructor(public volume: google.cloud.compute.v1.IDisk) {}

  get name(): string {
    return this.volume.name;
  }

  get zoneName(): string {
    return this.volume.zone.split('/').pop();
  }

  get selfLink(): string {
    return this.volume.selfLink;
  }

  public toStandardVolume(): CnCpVolume {
    return {
      region: this.zoneName,
      status: this.gcpVolumeStatusToCpStatus(),
      type: CnLabVolumeType.HIGH_SPEED,
      size: parseInt(this.volume.sizeGb.toString(), 10),
      id: this.name,
      originalObject: this.volume,
    };
  }

  private gcpVolumeStatusToCpStatus(): CnCpVolumeStatus {
    if (this.volume.status === 'READY' && this.volume.users?.length > 0) {
      return 'IN_USE';
    }
    switch (this.volume.status) {
      case 'READY':
        return 'AVAILABLE';
      case 'CREATING':
        return 'CREATING';
      case 'DELETING':
        return 'DELETING';
      case 'FAILED':
      default:
        throw new Error(`Unknown status ${this.volume.status} for GCP disk`);
    }
  }
}
