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
import { Exception } from 'handlebars';
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
   * For now, we don't need to provide an ssh public key because it is configured at project
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
    await instancesClient.start({
      project: projectId,
      zone,
      instance: name,
    });
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
      console.log('No common instance metadata found for the project.');
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
    await this.waitForAnyOperation(() =>
      zoneOperationsClient.get({
        project: projectId,
        zone,
        operation: operationName,
      })
    );
  }

  private async waitForRegionOperation(
    projectId: string,
    region: string,
    operationName: string
  ): Promise<void> {
    const regionOperationsClient = new RegionOperationsClient();
    await this.waitForAnyOperation(() =>
      regionOperationsClient.get({
        project: projectId,
        region,
        operation: operationName,
      })
    );
  }

  private async waitForAnyOperation(
    getOperation: () => Promise<[protos.google.cloud.compute.v1.IOperation, any, any]>
  ): Promise<void> {
    let i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [operation] = await getOperation();

      if (operation.status === 'DONE') {
        if (operation.error) {
          throw new Error(`Operation failed: ${JSON.stringify(operation.error)}`);
        }
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      i += 1;
      if (i > 60) {
        throw new Error('Operation timed out');
      }
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
      throw new Exception(`GCP credentials file not found.`);
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
