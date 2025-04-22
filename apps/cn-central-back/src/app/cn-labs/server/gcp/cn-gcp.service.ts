import { Injectable } from '@nestjs/common';
import { DisksClient, InstancesClient, protos, ZoneOperationsClient } from '@google-cloud/compute';
import { cnServerUbuntuUser } from '../cn-cloud-provider.class';
import { CnCoreConfigService } from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import * as fs from 'fs';

@Injectable()
export class CnGcpService {
  private instancesClient: InstancesClient;
  private disksClient: DisksClient;
  private zoneOperationsClient: ZoneOperationsClient;

  constructor(private configService: CnCoreConfigService) {
    this.instancesClient = new InstancesClient();
    this.disksClient = new DisksClient();
    this.zoneOperationsClient = new ZoneOperationsClient();
  }

  ///////////////////////////// INSTANCE /////////////////////////////

  async createInstance(
    name: string,
    zone: string,
    machineType: string,
    imageFamily: string,
    imageProject: string,
    sshPublicKeyPath: string,
    networkName: string,
    subnetName: string
  ): Promise<protos.google.cloud.compute.v1.IInstance> {
    const projectId = this.getProjectId();
    const zonePath = `projects/${projectId}/zones/${zone}`;
    const publicKey = fs.readFileSync(sshPublicKeyPath, 'utf8');

    const instanceConfig: protos.google.cloud.compute.v1.IInstance = {
      name,
      machineType: `${zonePath}/machineTypes/${machineType}`,
      disks: [
        {
          boot: true,
          autoDelete: true,
          initializeParams: {
            sourceImage: `projects/${imageProject}/global/images/family/${imageFamily}`,
          },
        },
      ],
      networkInterfaces: [
        {
          network: `projects/${projectId}/global/networks/${networkName}`,
          subnetwork: subnetName
            ? `projects/${projectId}/regions/${this.getRegionFromZone(zone)}/subnetworks/${subnetName}`
            : undefined,
          accessConfigs: [
            {
              name: 'External NAT',
              type: 'ONE_TO_ONE_NAT',
            },
          ],
        },
      ],
      metadata: {
        items: [
          {
            key: 'ssh-keys',
            value: `${cnServerUbuntuUser}:${publicKey}`,
          },
        ],
      },
    };

    const [operation] = await this.instancesClient.insert({
      project: projectId,
      zone,
      instanceResource: instanceConfig,
    });

    await this.waitForOperation(projectId, zone, operation.name);
    return instanceConfig;
  }

  async getInstance(name: string, zone: string): Promise<protos.google.cloud.compute.v1.IInstance> {
    const projectId = this.getProjectId();
    const [instance] = await this.instancesClient.get({
      project: projectId,
      zone,
      instance: name,
    });
    return instance;
  }

  async getIpAddress(name: string, zone: string): Promise<string> {
    const instance = await this.getInstance(name, zone);
    const networkInterfaces = instance.networkInterfaces;

    if (!networkInterfaces || networkInterfaces.length === 0) {
      throw new Error(`No network interfaces found for instance ${name}`);
    }

    const accessConfigs = networkInterfaces[0].accessConfigs;
    if (!accessConfigs || accessConfigs.length === 0) {
      throw new Error(`No external IP address found for instance ${name}`);
    }

    return accessConfigs[0].natIP;
  }

  async deleteInstance(name: string, zone: string): Promise<void> {
    const projectId = this.getProjectId();
    const [operation] = await this.instancesClient.delete({
      project: projectId,
      zone,
      instance: name,
    });

    await this.waitForOperation(projectId, zone, operation.name);
  }

  async startInstance(name: string, zone: string): Promise<void> {
    const projectId = this.getProjectId();
    const [operation] = await this.instancesClient.start({
      project: projectId,
      zone,
      instance: name,
    });

    await this.waitForOperation(projectId, zone, operation.name);
  }

  async stopInstance(name: string, zone: string): Promise<void> {
    const projectId = this.getProjectId();
    const [operation] = await this.instancesClient.stop({
      project: projectId,
      zone,
      instance: name,
    });

    await this.waitForOperation(projectId, zone, operation.name);
  }

  //////////////////////////// VOLUME ////////////////////////////

  async createVolume(
    name: string,
    zone: string,
    sizeGb: number
  ): Promise<protos.google.cloud.compute.v1.IDisk> {
    const projectId = this.getProjectId();

    const diskResource: protos.google.cloud.compute.v1.IDisk = {
      name,
      sizeGb: String(sizeGb),
      type: `projects/${projectId}/zones/${zone}/diskTypes/pd-ssd`, // Using SSD for better performance
      description: 'Created by CnLab',
    };

    const [operation] = await this.disksClient.insert({
      project: projectId,
      zone,
      diskResource,
    });

    await this.waitForDiskOperation(projectId, zone, operation.name);

    const [disk] = await this.disksClient.get({
      project: projectId,
      zone,
      disk: name,
    });

    return disk;
  }

  async getVolume(name: string, zone: string): Promise<protos.google.cloud.compute.v1.IDisk> {
    const projectId = this.getProjectId();
    const [disk] = await this.disksClient.get({
      project: projectId,
      zone,
      disk: name,
    });
    return disk;
  }

  async attachVolume(instanceName: string, volumeName: string, zone: string): Promise<void> {
    const projectId = this.getProjectId();

    // Get the disk to attach
    const disk = await this.getVolume(volumeName, zone);
    if (!disk) {
      throw new Error(`Disk ${volumeName} not found in zone ${zone}`);
    }

    // Prepare the attachment request
    const attachRequest = {
      project: projectId,
      zone,
      instance: instanceName,
      attachedDiskResource: {
        source: disk.selfLink,
        deviceName: volumeName,
        autoDelete: false,
      },
    };

    // Attach the disk to the instance
    const [operation] = await this.instancesClient.attachDisk(attachRequest);
    await this.waitForOperation(projectId, zone, operation.name);
  }

  async deleteVolume(name: string, zone: string): Promise<void> {
    const projectId = this.getProjectId();
    const [operation] = await this.disksClient.delete({
      project: projectId,
      zone,
      disk: name,
    });

    await this.waitForDiskOperation(projectId, zone, operation.name);
  }

  //////////////////////////// HELPER METHODS ////////////////////////////

  private async waitForOperation(projectId: string, zone: string, operationName: string): Promise<void> {
    while (true) {
      const [operation] = await this.zoneOperationsClient.get({
        project: projectId,
        zone,
        operation: operationName,
      });

      if (operation.status === 'DONE') {
        if (operation.error) {
          throw new Error(`Operation failed: ${JSON.stringify(operation.error)}`);
        }
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  private async waitForDiskOperation(projectId: string, zone: string, operationName: string): Promise<void> {
    while (true) {
      const [operation] = await this.zoneOperationsClient.get({
        project: projectId,
        zone,
        operation: operationName,
      });

      if (operation.status === 'DONE') {
        if (operation.error) {
          throw new Error(`Disk operation failed: ${JSON.stringify(operation.error)}`);
        }
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  getProjectId(): string {
    return this.configService.getGcpProjectId();
  }

  getRegionFromZone(zone: string): string {
    const parts = zone.split('-');
    return parts.slice(0, -1).join('-');
  }
}
