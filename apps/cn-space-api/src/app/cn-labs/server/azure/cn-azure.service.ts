import {
  ComputeManagementClient,
  Disk,
  ImageReference,
  SshPublicKey,
  SshPublicKeyResource,
  VirtualMachine,
} from '@azure/arm-compute';
import { NetworkManagementClient, PublicIPAddress } from '@azure/arm-network';
import { DefaultAzureCredential } from '@azure/identity';
import { Injectable } from '@nestjs/common';

import { CnCoreConfigService } from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CN_SERVER_UBUNTU_USER } from '../cn-cloud-provider.class';

@Injectable()
export class CnAzureService {
  constructor(private configService: CnCoreConfigService) {}

  ///////////////////////////// INSTANCE /////////////////////////////

  // Create an instance
  async createInstance(
    name: string,
    region: string,
    vmSize: string,
    imageRef: ImageReference,
    sshPublicKey: SshPublicKey,
    subnetId: string
  ): Promise<VirtualMachine> {
    // await this.listImageReferences();
    const computeClient = this.getComputeClient();

    const vmParameters: VirtualMachine = {
      location: region,

      osProfile: {
        computerName: name,
        adminUsername: CN_SERVER_UBUNTU_USER,
        linuxConfiguration: {
          ssh: {
            publicKeys: [sshPublicKey],
          },
        },
      },
      hardwareProfile: {
        vmSize: vmSize,
      },
      storageProfile: {
        // use ubuntu 20.04 LTS
        imageReference: imageRef,
      },
      networkProfile: {
        networkApiVersion: '2021-08-01',
        networkInterfaceConfigurations: [
          {
            name: name,
            ipConfigurations: [
              {
                subnet: {
                  id: subnetId,
                },
                name: name,
                publicIPAddressConfiguration: {
                  name: name,
                  publicIPAllocationMethod: 'Static',
                },
              },
            ],
          },
        ],
      },
    };

    return await computeClient.virtualMachines.beginCreateOrUpdateAndWait(
      this.getResourceGroup(),
      name,
      vmParameters
    );
  }

  public async getInstance(name: string): Promise<VirtualMachine> {
    const computeClient = this.getComputeClient();

    // instance.instanceView
    return await computeClient.virtualMachines.get(this.getResourceGroup(), name, { expand: 'instanceView' });
  }

  public getIpAddresses(id: string): Promise<PublicIPAddress> {
    const networkClient = this.getNetworkClient();

    return networkClient.publicIPAddresses.get(this.getResourceGroup(), id);
  }

  public deleteInstance(name: string): Promise<void> {
    const computeClient = this.getComputeClient();

    return computeClient.virtualMachines.beginDeleteAndWait(this.getResourceGroup(), name);
  }

  // Start an instance
  async startInstance(name: string): Promise<void> {
    const computeClient = this.getComputeClient();

    await computeClient.virtualMachines.beginStart(this.getResourceGroup(), name);
  }

  // Stop an instance
  async stopInstance(name: string): Promise<void> {
    const computeClient = this.getComputeClient();

    await computeClient.virtualMachines.beginDeallocate(this.getResourceGroup(), name);
  }

  //////////////////////////// VOLUME ////////////////////////////

  // Create a volume
  async createVolume(name: string, region: string, size: number): Promise<Disk> {
    const computeClient = this.getComputeClient();

    return computeClient.disks.beginCreateOrUpdateAndWait(this.getResourceGroup(), name, {
      name: name,
      sku: {
        name: 'Premium_LRS',
      },
      diskSizeGB: size,
      location: region,
      creationData: {
        createOption: 'empty',
      },
    });
  }

  async getVolume(name: string): Promise<Disk> {
    const computeClient = this.getComputeClient();

    return computeClient.disks.get(this.getResourceGroup(), name);
  }

  // Attach a volume to an instance
  async attachVolume(instanceName: string, volumeName: string): Promise<VirtualMachine> {
    const computeClient = this.getComputeClient();

    const instance = await this.getInstance(instanceName);

    const diskId = `${this.getResourceGroupFullId()}/providers/Microsoft.Compute/disks/${volumeName}`;
    instance.storageProfile.dataDisks.push({
      name: volumeName,
      lun: 1, // id of the disk for this VM
      createOption: 'attach',
      managedDisk: {
        id: diskId,
      },
    });

    return computeClient.virtualMachines.beginCreateOrUpdateAndWait(
      this.getResourceGroup(),
      instanceName,
      instance
    );
  }

  async deleteVolume(name: string): Promise<void> {
    const computeClient = this.getComputeClient();

    return computeClient.disks.beginDeleteAndWait(this.getResourceGroup(), name);
  }

  //////////////////////////// OTHER ////////////////////////////
  public getSshKey(name: string): Promise<SshPublicKeyResource> {
    const computeClient = this.getComputeClient();
    return computeClient.sshPublicKeys.get(this.getResourceGroup(), name);
  }

  private getComputeClient(): ComputeManagementClient {
    const credential = new DefaultAzureCredential();
    return new ComputeManagementClient(credential, this.getSubscriptionId());
  }

  private getNetworkClient(): NetworkManagementClient {
    const credential = new DefaultAzureCredential();
    return new NetworkManagementClient(credential, this.getSubscriptionId());
  }

  public getResourceGroup(): string {
    return this.configService.getAzureResourceGroup();
  }

  public getSubscriptionId(): string {
    return this.configService.getAzureSubscriptionId();
  }

  public getResourceGroupFullId(): string {
    return `/subscriptions/${this.getSubscriptionId()}/resourceGroups/${this.getResourceGroup()}`;
  }
}
