import { CnCloudProviderName } from '../../cn-cloud-providers/cn-cloud-provider.entity';
import { CnCoreConfigService } from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCommandService } from '../../cn-core/services/cn-command.service';
import { CnLab } from '../cn-lab.entity';
import {
  CnCpCreateInstanceRequest,
  CnCpCreateVolumeRequest,
  CnCpInstance,
  CnCpInstanceWithVolume,
  CnCpStaticIpAddress,
  CnCpVolume,
} from './cn-cloud-provider.class';
import { CnLabSshService } from './cn-lab-ssh.service';

/**
 * Abstract class to communicate with different cloud provider
 */
export abstract class CnCloudProviderService {
  protected constructor(
    protected commandService: CnCommandService,
    protected configService: CnCoreConfigService
  ) {}

  public abstract getName(): CnCloudProviderName;

  public abstract getSshUserName(): string;

  public abstract getSshPrivateKeyFilePath(): string;

  /**
   * Create an instance
   * Call if volumeIsCreatedSeparately is true
   */
  public abstract createInstance(request: CnCpCreateInstanceRequest): Promise<CnCpInstance>;

  /**
   * Create an instance with a volume directly attached
   * Call if volumeIsCreatedSeparately is false
   */
  public abstract createInstanceWithVolume(
    instanceRequest: CnCpCreateInstanceRequest,
    volumeRequest: CnCpCreateVolumeRequest
  ): Promise<CnCpInstanceWithVolume>;

  public abstract getInstance(id: string, region: string): Promise<CnCpInstance>;

  public abstract deleteInstance(id: string, region: string): Promise<void>;

  public abstract startInstance(id: string, region: string): Promise<void>;

  public abstract stopInstance(id: string, region: string): Promise<void>;

  ////////////////////////////////// VOLUME //////////////////////////////////////

  public abstract volumeIsCreatedSeparately(): boolean;

  public abstract createVolume(volume: CnCpCreateVolumeRequest): Promise<CnCpVolume>;

  public abstract attachVolumeToInstance(
    instanceId: string,
    volumeId: string,
    region: string
  ): Promise<CnCpVolume>;

  public abstract mountVolume(lab: CnLab): Promise<void>;

  public abstract getVolume(volumeId: string, region: string): Promise<CnCpVolume>;

  public abstract deleteVolume(volumeId: string, region: string): Promise<void>;

  public abstract volumeIsAttachedToInstance(
    instanceId: string,
    volumeId: string,
    region: string
  ): Promise<boolean>;

  ///////////////////////////////// IP ADDRESS //////////////////////////////////////

  /**
   * Check if the cloud provider need a static IP address before creating the instance
   * If true, the static IP address will be created before the instance (GCP)
   * If false, the static IP address will be created after the instance (others)
   *
   */
  public abstract needStaticIpAddressBeforeInstance(): boolean;

  /**
   * Create a static IP address for the instance
   * If the cloud provider can create the static IP address with the instance name, this is not needed
   * This is not call if needStaticIpAddressForInstance() is false
   */
  public abstract createStaticIpAddress(name: string, region: string): Promise<CnCpStaticIpAddress | null>;

  public abstract deleteIpAddress(ipAddressId: string, region: string): Promise<void>;

  public abstract getIpAddressFromInstanceId(instanceId: string, region: string): Promise<string>;

  public abstract getIpAddressFromId(
    ipAddressId: string,
    regionName: string
  ): Promise<CnCpStaticIpAddress | null>;

  public instantiateLabSshService(lab: CnLab): CnLabSshService {
    return new CnLabSshService(
      this.commandService,
      this.configService.isLocal(),
      this.getSshUserName(),
      lab.virtualHost,
      lab.id,
      this.getSshPrivateKeyFilePath()
    );
  }
}
