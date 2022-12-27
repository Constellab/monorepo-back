import {
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpVolume
} from './cn-cloud-provider-external.class';
import {CnCloudProviderName} from '../../cn-cloud-providers/cn-cloud-provider.entity';


export abstract class CnCloudProviderExternalService {

  public abstract getName(): CnCloudProviderName;

  public abstract createInstance(request: CnCpCreateInstanceRequest): Promise<CnCpInstance>;

  public abstract getInstance(id: string): Promise<CnCpInstance>;

  public abstract deleteInstance(id: string): Promise<void>;

  public abstract createVolume(volume: CnCpCreateVolumeRequest): Promise<CnCpVolume>;

  public abstract attachVolumeToInstance(instanceId: string, volumeId: string): Promise<CnCpVolume> ;

  public abstract getVolume(volumeId: string): Promise<CnCpVolume>;

  public abstract deleteVolume(volumeId: string): Promise<void>;
}
