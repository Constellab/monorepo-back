import { EC2Client, StartInstancesCommand, StartInstancesCommandOutput } from '@aws-sdk/client-ec2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CnAwsService {

  constructor(private region: string,
              private accessKeyId: string,
              private secretAccessKey: string) {
  }

  async startInstance(instanceId: string): Promise<StartInstancesCommandOutput> {
    const command = new StartInstancesCommand({InstanceIds: [instanceId]});

    try {
      return await this.getEc2Client().send(command);
    } catch (error) {
      console.error('Error starting instance', error);
      throw error;
    }
  }

  async stopInstance(instanceId: string): Promise<StartInstancesCommandOutput> {
    const command = new StartInstancesCommand({InstanceIds: [instanceId]});

    try {
      return await this.getEc2Client().send(command);
    } catch (error) {
      console.error('Error stopping instance', error);
      throw error;
    }

  }

  private getEc2Client(): EC2Client {

    // Create an EC2 client with credentials
    return new EC2Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey
      }
    });
  }
}
