import {
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpVolume
} from './cn-cloud-provider.class';
import { CnCloudProviderName } from '../../cn-cloud-providers/cn-cloud-provider.entity';
import { CnLab } from '../cn-lab.entity';
import { CnLabSshService } from './cn-lab-ssh.service';
import { CnCommandService } from '../../cn-core/services/cn-command.service';
import { CnCoreConfigService } from '../../cn-core/modules/cn-core-config/cn-core-config.service';

/**
 * Abstract class to communicate with different cloud provider
 */
export abstract class CnCloudProviderService {

  protected constructor(protected commandService: CnCommandService,
                        protected configService: CnCoreConfigService) {
  }

  public abstract getName(): CnCloudProviderName;

  public abstract getSshUserName(): string;

  public abstract getSshKeyFileName(): string;

  public abstract createInstance(request: CnCpCreateInstanceRequest): Promise<CnCpInstance>;

  public abstract getInstance(id: string): Promise<CnCpInstance>;

  public abstract getIpAddress(id: string): Promise<string>;

  public abstract deleteInstance(id: string): Promise<void>;

  public abstract startInstance(id: string): Promise<void>;

  public abstract stopInstance(id: string): Promise<void>;

  public abstract createVolume(volume: CnCpCreateVolumeRequest): Promise<CnCpVolume>;

  public abstract attachVolumeToInstance(instanceId: string, volumeId: string): Promise<CnCpVolume> ;

  public abstract mountVolume(lab: CnLab): Promise<void> ;

  public abstract getVolume(volumeId: string): Promise<CnCpVolume>;

  public abstract deleteVolume(volumeId: string): Promise<void>;

  public abstract volumeIsAttachedToInstance(instanceId: string, volumeId: string): Promise<boolean>;

  public instantiateLabSshService(lab: CnLab): CnLabSshService {
    return new CnLabSshService(this.commandService,
      this.configService.isLocal(),
      this.getSshUserName(),
      lab.virtualHost,
      lab.id,
      this.getSshKeyFileName());
  }

}
