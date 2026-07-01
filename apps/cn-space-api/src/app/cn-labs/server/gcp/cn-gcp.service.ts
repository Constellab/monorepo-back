import {
  AddressesClient,
  DisksClient,
  InstancesClient,
  ProjectsClient,
  protos,
  RegionOperationsClient,
  ZoneOperationsClient,
} from '@google-cloud/compute';
import { Injectable, Logger } from '@nestjs/common';
import { existsSync } from 'fs';

import { CnCoreConfigService } from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnGcpHelper, CnGcpInstance, CnGcpVolume } from './cn-gcp.class';

export interface CnGcpCreateInstanceRequest {
  name: string;
  zone: string;
  machineType: string;
  imageFamily: string;
  imageProject: string;
  staticIp: string;
  subnetName: string;
  volumeSizeGb: number;
  volumeArchitecture: string;
  tags?: string[];
}

@Injectable()
export class CnGcpService {
  private readonly logger = new Logger(CnGcpService.name);

  constructor(private configService: CnCoreConfigService) {}

  ///////////////////////////// INSTANCE /////////////////////////////

  /**
   * Creates a GCP instance and a volume.
   * For now, we don't need to provide an ssh public key because it is configured a project
   * level and new instances automatically inherit the project-level metadata.
   * @param createInstance
   */
  async createInstanceAndVolume(createInstance: CnGcpCreateInstanceRequest): Promise<CnGcpInstance> {
    const projectId = this.getProjectId();
    const zonePath = `projects/${projectId}/zones/${createInstance.zone}`;
    const region = CnGcpHelper.getRegionNameFromZoneName(createInstance.zone);

    const accessConfig = {
      name: 'External NAT',
      type: 'PREMIUM',
      natIP: createInstance.staticIp,
    };

    const instanceConfig: protos.google.cloud.compute.v1.IInstance = {
      name: createInstance.name,
      machineType: `${zonePath}/machineTypes/${createInstance.machineType}`,
      disks: [
        {
          boot: true,
          autoDelete: false,
          initializeParams: {
            sourceImage:
              `projects/${createInstance.imageProject}/global/images/` +
              `family/${createInstance.imageFamily}`,
          },
          type: `projects/${projectId}/zones/${createInstance.zone}/diskTypes/pd-balanced`,
          diskSizeGb: createInstance.volumeSizeGb,
          architecture: createInstance.volumeArchitecture,
        },
      ],
      networkInterfaces: [
        {
          subnetwork: `projects/${projectId}/regions/${region}` + `/subnetworks/${createInstance.subnetName}`,
          accessConfigs: [accessConfig],
          stackType: 'IPV4_ONLY',
        },
      ],
      tags: {
        items: createInstance.tags,
      },
    };

    const instancesClient = this.getInstanceClient();
    await instancesClient.insert({
      project: projectId,
      zone: createInstance.zone,
      instanceResource: instanceConfig,
    });

    return this.getInstance(createInstance.name, createInstance.zone);
  }

  async getInstance(name: string, zone: string): Promise<CnGcpInstance> {
    const projectId = this.getProjectId();
    const instancesClient = this.getInstanceClient();
    const [instance] = await instancesClient.get({
      project: projectId,
      zone,
      instance: name,
    });
    return new CnGcpInstance(instance);
  }

  async deleteInstance(name: string, zone: string): Promise<void> {
    const projectId = this.getProjectId();
    const instancesClient = this.getInstanceClient();
    const [operation] = await instancesClient.delete({
      project: projectId,
      zone,
      instance: name,
    });

    await this.waitForZoneOperation(projectId, zone, operation.name);
  }

  async startInstance(name: string, zone: string): Promise<void> {
    const projectId = this.getProjectId();
    const instancesClient = this.getInstanceClient();
    const [operation] = await instancesClient.start({
      project: projectId,
      zone,
      instance: name,
    });

    await this.waitForZoneOperation(projectId, zone, operation.name);
  }

  async stopInstance(name: string, zone: string): Promise<void> {
    const projectId = this.getProjectId();
    const instancesClient = this.getInstanceClient();
    await instancesClient.stop({
      project: projectId,
      zone,
      instance: name,
    });
  }

  async rebootInstance(name: string, zone: string): Promise<void> {
    const projectId = this.getProjectId();
    const instancesClient = this.getInstanceClient();
    // GCP exposes reset as the instance reboot primitive (the VM stays allocated and the disk attached)
    await instancesClient.reset({
      project: projectId,
      zone,
      instance: name,
    });
  }

  //////////////////////////// VOLUME ////////////////////////////

  async getVolume(name: string, zone: string): Promise<CnGcpVolume> {
    const disksClient = this.getDisksClient();

    const projectId = this.getProjectId();
    const [disk] = await disksClient.get({
      project: projectId,
      zone,
      disk: name,
    });
    return new CnGcpVolume(disk);
  }

  async deleteVolume(name: string, zone: string): Promise<void> {
    const projectId = this.getProjectId();
    const disksClient = this.getDisksClient();
    const [operation] = await disksClient.delete({
      project: projectId,
      zone,
      disk: name,
    });

    await this.waitForZoneOperation(projectId, zone, operation.name);
  }

  //////////////////////////// STATIC IP ADDRESS ////////////////////////////

  async getIpAddressFromInstance(instanceName: string, zone: string): Promise<string> {
    const instance = await this.getInstance(instanceName, zone);
    const networkInterfaces = instance.networkInterfaces;

    if (!networkInterfaces || networkInterfaces.length === 0) {
      throw new Error(`No network interfaces found for instance ${instanceName}`);
    }

    const accessConfigs = networkInterfaces[0].accessConfigs;
    if (!accessConfigs || accessConfigs.length === 0) {
      throw new Error(`No external IP address found for instance ${instanceName}`);
    }

    return accessConfigs[0].natIP;
  }

  async createStaticIpAddress(
    name: string,
    region: string
  ): Promise<protos.google.cloud.compute.v1.IAddress> {
    const projectId = this.getProjectId();
    const addressesClient = this.getAddressesClient();

    const addressResource: protos.google.cloud.compute.v1.IAddress = {
      name,
      description: 'Static IP created by CnLab',
      addressType: 'EXTERNAL',
      networkTier: 'PREMIUM',
    };

    const [operation] = await addressesClient.insert({
      project: projectId,
      region,
      addressResource,
    });

    await this.waitForRegionOperation(projectId, region, operation.name);

    // Get the IP address
    const [addressInfo] = await addressesClient.get({
      project: projectId,
      region,
      address: name,
    });

    return addressInfo;
  }

  async getStaticIpAddress(name: string, region: string): Promise<protos.google.cloud.compute.v1.IAddress> {
    const projectId = this.getProjectId();
    const addressesClient = this.getAddressesClient();

    const [addressInfo] = await addressesClient.get({
      project: projectId,
      region,
      address: name,
    });

    return addressInfo;
  }

  async deleteStaticIpAddress(name: string, region: string): Promise<void> {
    const projectId = this.getProjectId();
    const addressesClient = this.getAddressesClient();

    const [operation] = await addressesClient.delete({
      project: projectId,
      region,
      address: name,
    });

    await this.waitForRegionOperation(projectId, region, operation.name);
  }

  //////////////////////////// PROJECT ////////////////////////////
  /**
   * Retrieves SSH public keys stored in the project-level metadata.
   * @returns A promise that resolves to the string containing SSH keys, or null if not found.
   */
  async getProjectSshKeys(keyName: string): Promise<string | null> {
    const projectsClient = new ProjectsClient();
    const projectId = this.getProjectId(); // Assuming you have a method to get the project ID

    const [project] = await projectsClient.get({
      project: projectId,
    });

    const metadata = project.commonInstanceMetadata?.items;
    if (!metadata) {
      this.logger.error('No common instance metadata found for the project.');
      return null;
    }

    // we use the part of the public key after the username@ at the end to
    // distinguish the keys (prod, preprod, dev)
    const sshKeysItem = metadata.find(
      (item) => item.key === 'ssh-keys' && item.value && item.value.endsWith(keyName)
    );

    if (!sshKeysItem) {
      this.logger.error(`[GCP] No ssh-keys found for ${keyName}`);
      throw new Error('Failed to retrieve project information, please retry later.');
    }

    return sshKeysItem.value;
  }

  //////////////////////////// HELPER METHODS ////////////////////////////

  private async waitForZoneOperation(projectId: string, zone: string, operationName: string): Promise<void> {
    const zoneOperationsClient = new ZoneOperationsClient();
    await this.waitForAnyOperation(
      () =>
        zoneOperationsClient.get({
          project: projectId,
          zone,
          operation: operationName,
        }),
      `zone operation ${operationName} (zone ${zone})`
    );
  }

  private async waitForRegionOperation(
    projectId: string,
    region: string,
    operationName: string
  ): Promise<void> {
    const regionOperationsClient = new RegionOperationsClient();
    await this.waitForAnyOperation(
      () =>
        regionOperationsClient.get({
          project: projectId,
          region,
          operation: operationName,
        }),
      `region operation ${operationName} (region ${region})`
    );
  }

  private async waitForAnyOperation(
    getOperation: () => Promise<[protos.google.cloud.compute.v1.IOperation, any, any]>,
    label: string
  ): Promise<void> {
    const maxAttempts = 60;
    // Per-poll timeout so a hung get() call (e.g. blocked credentials resolution
    // or a stalled network request) cannot block the whole loop indefinitely.
    const pollTimeoutMs = 30000;

    this.logger.log(`Waiting for GCP ${label} to complete`);

    for (let i = 0; i < maxAttempts; i++) {
      let operation: protos.google.cloud.compute.v1.IOperation;
      try {
        [operation] = await this.withTimeout(
          getOperation(),
          pollTimeoutMs,
          `GCP ${label} status poll timed out after ${pollTimeoutMs}ms (attempt ${i + 1}/${maxAttempts})`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`GCP ${label} failed while polling status: ${message}`);
        throw error;
      }

      if (operation.status === 'DONE') {
        if (operation.error) {
          this.logger.error(`GCP ${label} finished with an error: ${JSON.stringify(operation.error)}`);
          throw new Error(`Operation failed: ${JSON.stringify(operation.error)}`);
        }
        this.logger.log(`GCP ${label} completed`);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.logger.error(`GCP ${label} timed out after ${maxAttempts} attempts`);
    throw new Error(`GCP ${label} timed out`);
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    let timeoutHandle: NodeJS.Timeout;
    const timeout = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error(message)), timeoutMs);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  getProjectId(): string {
    return this.configService.getGcpProjectId();
  }

  private getInstanceClient(): InstancesClient {
    // First, verify the credentials file exists
    // we need to check if the credentials file exists,
    // otherwise GCP throw an error that is not catchable and break the application
    const credentialsPath = this.configService.getGcpCredentialsFilePath();

    if (!credentialsPath || !existsSync(credentialsPath)) {
      this.logger.error(`GCP credentials file not found at ${credentialsPath}`);
      throw new Error(`GCP credentials file not found.`);
    }

    return new InstancesClient();
  }

  private getDisksClient(): DisksClient {
    return new DisksClient();
  }

  private getAddressesClient(): AddressesClient {
    return new AddressesClient();
  }
}
