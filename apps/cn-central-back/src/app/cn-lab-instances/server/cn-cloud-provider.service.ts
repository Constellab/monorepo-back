import {CnCpCreateInstanceRequest, CnCpCreateVolumeRequest, CnCpInstance, CnCpVolume} from './cn-cloud-provider.class';
import {CnCloudProviderName} from '../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnLabInstance} from '../cn-lab-instance.entity';

/**
 * Abstract class to communicate with different cloud provider
 */
export abstract class CnCloudProviderService {

  public abstract getName(): CnCloudProviderName;

  public abstract createInstance(request: CnCpCreateInstanceRequest): Promise<CnCpInstance>;

  public abstract getInstance(id: string): Promise<CnCpInstance>;

  public abstract getIpAddress(id: string): Promise<string>;

  public abstract deleteInstance(id: string): Promise<void>;

  public abstract startInstance(id: string): Promise<void>;

  public abstract stopInstance(id: string): Promise<void>;

  public abstract createVolume(volume: CnCpCreateVolumeRequest): Promise<CnCpVolume>;

  public abstract attachVolumeToInstance(instanceId: string, volumeId: string): Promise<CnCpVolume> ;

  public abstract mountVolume(labInstance: CnLabInstance): Promise<void> ;

  public abstract getVolume(volumeId: string): Promise<CnCpVolume>;

  public abstract deleteVolume(volumeId: string): Promise<void>;

  public abstract volumeIsAttachedToInstance(instanceId: string, volumeId: string): Promise<boolean>;
}
