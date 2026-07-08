import { DataDisk, InstanceViewStatus, VirtualMachine } from '@azure/arm-compute';
import { ClHelpService } from '@monorepo/core-lib';
import { Logger } from '@nestjs/common';

import { CnLabBillingMode } from '../../cn-lab.entity';
import { CnCpInstance, CnCpInstanceStatus, CnCpInstanceStatusObject } from '../cn-cloud-provider.class';

export type CnAzureInstanceStatus =
  | 'ProvisioningState/succeeded'
  | 'ProvisioningState/creating'
  | 'ProvisioningState/deleting'
  | 'ProvisioningState/failed'
  | 'ProvisioningState/updating'
  | 'ProvisioningState/failed/AllocationFailed'
  | 'PowerState/deallocated'
  | 'PowerState/deallocating'
  | 'PowerState/running'
  | 'PowerState/starting'
  | 'PowerState/stopped'
  | 'PowerState/stopping';

export class CnAzureInstance {
  private readonly logger = new Logger(CnAzureInstance.name);

  constructor(public instance: VirtualMachine) {}

  get name(): string {
    if (this.instance.name == null) {
      throw new Error('No name found for the azure instance');
    }
    return this.instance.name;
  }

  get id(): string {
    return this.name;
  }

  get location(): string {
    return this.instance.location;
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

  getLastStatus(): InstanceViewStatus {
    const statuses = this.instance.instanceView?.statuses;
    if (statuses == null || ClHelpService.isNullOrEmpty(statuses)) {
      throw new Error('No status found for the azure instance');
    }
    return statuses[statuses.length - 1];
  }

  getStandardStatus(): CnCpInstanceStatusObject {
    const lastStatus = this.getLastStatus();

    if (lastStatus.level === 'Error') {
      return {
        status: 'ERROR',
        message: ((lastStatus.displayStatus ?? '') + ' ' + (lastStatus.message ?? '')).trim(),
      };
    }

    const status = this.azureInstanceStatusToCpStatus(lastStatus.code as CnAzureInstanceStatus);
    return {
      status,
      message: lastStatus.displayStatus + ' ' + lastStatus.message,
    };
  }

  private azureInstanceStatusToCpStatus(status: CnAzureInstanceStatus): CnCpInstanceStatus {
    switch (status) {
      case 'ProvisioningState/succeeded':
      case 'ProvisioningState/creating':
      case 'ProvisioningState/failed':
      case 'ProvisioningState/updating':
      case 'PowerState/starting':
        return 'CREATING';
      case 'PowerState/running':
        return 'RUNNING';
      case 'PowerState/stopped':
      case 'PowerState/deallocated':
        return 'STOPPED';
      case 'PowerState/stopping':
      case 'PowerState/deallocating':
      case 'ProvisioningState/deleting':
        return 'STOPPING';
      case 'ProvisioningState/failed/AllocationFailed':
        return 'ERROR';
      default:
        this.logger.error(`Unknown status ${String(status)} for azure instance ${this.name}`);
        return 'ERROR';
    }
  }

  getNetworkId(): string {
    const fullId = this.instance.networkProfile?.networkInterfaces?.[0]?.id;
    if (fullId == null) {
      throw new Error('No network interface found for the azure instance');
    }
    const parts = fullId.split('/');
    return parts[parts.length - 1];
  }

  getVolume(): DataDisk | null {
    const dataDisks = this.instance.storageProfile?.dataDisks;
    if (dataDisks == null || dataDisks.length === 0) {
      return null;
    }
    return dataDisks[0];
  }

  getVolumeName(): string | null {
    return this.getVolume()?.name ?? null;
  }

  /**
   * Return the os disk, this is the disk that were generated when the instance was created
   * The name is different from the instance name
   */
  getOsDiskName(): string {
    const name = this.instance.storageProfile?.osDisk?.name;
    if (name == null) {
      throw new Error('No os disk found for the azure instance');
    }
    return name;
  }
}

export type CnAzureVolumeStatus = 'Unattached' | 'Attached' | 'Reserved' | 'Frozen' | 'Detached';
