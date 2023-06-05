import {DataDisk, VirtualMachine} from '@azure/arm-compute';
import {ClHelpService} from '@monorepo/core-lib';

export type CnAzureInstanceStatus =
  'ProvisioningState/succeeded'
  | 'ProvisioningState/creating'
  | 'ProvisioningState/deleting'
  | 'ProvisioningState/failed'
  | 'ProvisioningState/updating'
  | 'PowerState/deallocated'
  | 'PowerState/deallocating'
  | 'PowerState/running'
  | 'PowerState/starting'
  | 'PowerState/stopped'
  | 'PowerState/stopping';

export class CnAzureInstance {

  constructor(public instance: VirtualMachine) {
  }

  get name(): string {
    return this.instance.name;
  }

  get id(): string {
    return this.instance.name;
  }

  get location(): string {
    return this.instance.location;
  }

  getStatus(): CnAzureInstanceStatus {
    const statuses = this.instance.instanceView.statuses;
    if (ClHelpService.isNullOrEmpty(statuses)) {
      throw new Error('No status found for the azure instance');
    }
    const lastStatus = statuses[statuses.length - 1];

    return lastStatus.code as CnAzureInstanceStatus;
  }

  getNetworkId(): string {
    const fullId = this.instance.networkProfile.networkInterfaces[0].id;
    const parts = fullId.split('/');
    return parts[parts.length - 1];
  }

  getVolume(): DataDisk | null {
    if (this.instance.storageProfile.dataDisks.length === 0) {
      return null;
    }
    return this.instance.storageProfile.dataDisks[0];
  }

  getVolumeName(): string | null {
    return this.getVolume()?.name ?? null;
  }

  /**
   * Return the os disk, this is the disk that were generated when the instance was created
   * The name is different from the instance name
   */
  getOsDiskName(): string {
    return this.instance.storageProfile.osDisk.name;
  }
}

export type CnAzureVolumeStatus = 'Unattached' | 'Attached' | 'Detached';
