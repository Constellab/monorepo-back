import {BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from 'typeorm';
import {Exclude, Expose, Type} from 'class-transformer';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnEntityWithStatus} from '../cn-core/model/entities/cn-entity-with-status.entity';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {CnServerCloud} from '../cn-servers-info/server-cloud/cn-server-cloud.entity';
import {CnLabInstanceServerTaskStatus, CnLabInstanceStatus} from './status/cn-lab-instance-status.enum';
import {randomBytes} from 'crypto';
import {CnExternalApiInfo} from '../cn-core/model/config/cn-config.class';
import {CnSpace} from '../cn-spaces/cn-space.entity';
import {CnLabInstanceUser} from './user/cn-lab-instance-user.entity';
import {BlBadRequestException, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnCloudProviderName} from '../cn-cloud-providers/cn-cloud-provider.entity';
import {DateTime} from 'luxon';

export enum CnLabInstanceType {
  CLOUD = 'CLOUD',
  DESKTOP = 'DESKTOP',
  ON_PREMISE = 'ON_PREMISE' // hosted and managed by the client
}

export enum CnLabInstanceBillingMode {
  HOURLY = 'HOURLY',
  MONTHLY = 'MONTHLY'
}

export enum CnLabInstanceVolumeType {
  CLASSIC = 'CLASSIC',
  HIGH_SPEED = 'HIGH_SPEED'
}

export enum CnLabDesktopPlatform {
  LINUX = 'LINUX',
  WINDOWS = 'WINDOWS',
  MAC = 'MAC'
}

export enum CnLabDomain {
  CONSTELLAB_APP = 'constellab.app',
  GENCOVERY_IO = 'gencovery.io'
}

/**
 * A lab instance is a running lab
 */
@Entity('lab_instance')
export class CnLabInstance extends CnEntityWithStatus<CnLabInstanceStatusHistory> {

  public static readonly SUPPORTED_MAIN_DOMAINS: string[] = [CnLabDomain.CONSTELLAB_APP, CnLabDomain.GENCOVERY_IO];
  public static readonly SPACE_API_ROUTE = 'space-api';
  public static readonly S3_API_ROUTE = 's3-server/v1';
  public static readonly CORE_API_ROUTE = 'core-api';

  @Column({nullable: false, length: 50})
  name: string;

  @Column({
    type: 'enum', enum: CnLabInstanceType, nullable: false,
  })
  type: CnLabInstanceType;

  @Type(() => CnLabConfig)
  @ManyToOne(() => CnLabConfig, {nullable: true})
  labConfig: CnLabConfig;

  @Column({nullable: true})
  labConfigId?: string;

  @Type(() => CnLabInstanceStatusHistory)
  @OneToOne(() => CnLabInstanceStatusHistory, {
    nullable: true, eager: true,
    onUpdate: 'RESTRICT', onDelete: 'RESTRICT'
  })
  @JoinColumn()
  currentStatus: CnLabInstanceStatusHistory;

  // api key shared with the glab instance API
  @Exclude()
  @Column({nullable: false, length: 255, unique: true})
  glabApiKey: string;

  // api key shared with the lab manager APImi
  @Exclude()
  @Column({nullable: true, length: 255, unique: true})
  labManagerApiKey: string;

  @Column({nullable: true, length: 255, unique: true})
  virtualHost: string;

  // api key shared with the lab manager API
  @Exclude()
  @Column({nullable: true, length: 255})
  codelabToken: string;

  @Exclude()
  @Column({nullable: false, length: 255})
  gwsCoreProdDbPassword: string;

  @Exclude()
  @Column({nullable: false, length: 255})
  gwsCoreDevDbPassword: string;

  @ManyToOne(() => CnSpace, {nullable: false})
  space: CnSpace;

  @Column({nullable: false})
  spaceId?: string;

  @OneToMany(() => CnLabInstanceUser,
    (instanceGroup) => instanceGroup.labInstance,
    {cascade: ['insert']})
  sharedGroups: CnLabInstanceUser[];

  @Type(() => CnServerCloud)
  @ManyToOne(() => CnServerCloud,
    {nullable: true})
  serverCloud: CnServerCloud;

  @ManyToOne(() => CnCloudProviderRegion,
    {onDelete: 'RESTRICT', eager: true, nullable: true})
  region: CnCloudProviderRegion;

  // id of the ovh, aws, instance
  @Exclude()
  @Column({nullable: true, length: 255})
  serverInstanceId: string;

  // id of the ovh, aws, volume
  @Exclude()
  @Column({nullable: true, length: 255})
  serverVolumeId: string;

  @Exclude()
  @Column({nullable: false, default: false})
  dnsConfigured: boolean;

  // text about the current or last server task status
  @Exclude()
  @Column({type: 'text', nullable: true})
  serverTaskText: string;

  @Exclude()
  @Column({
    type: 'enum', enum: CnLabInstanceServerTaskStatus, nullable: false,
    default: CnLabInstanceServerTaskStatus.NONE
  })
  serverTaskStatus: CnLabInstanceServerTaskStatus;

  @Exclude()
  @BlLuxonDateTimeColumn({nullable: true})
  serverTaskDatetime: DateTime;

  @Column({
    type: 'enum', enum: CnLabInstanceBillingMode, nullable: true,
  })
  billingMode: CnLabInstanceBillingMode;

  @Column({nullable: true, type: 'int'})
  volumeSize: number;

  @Column({
    type: 'enum', enum: CnLabInstanceVolumeType, nullable: true,
  })
  volumeType: CnLabInstanceVolumeType;

  @Column({
    type: 'enum', enum: CnLabDesktopPlatform, nullable: true,
  })
  desktopPlatform: CnLabDesktopPlatform;

  @Column({nullable: false, default: false})
  isFreeTrial: boolean;

  // url of the api server
  @Expose()
  get glabUrl(): string {
    return `https://glab.${this.virtualHost}`;
  }

  @Expose()
  get frontUrl(): string {
    return `https://front.${this.virtualHost}`;
  }

  @Expose()
  get labManagerUrl(): string {
    return `https://lab-manager.${this.virtualHost}`;
  }


  // generate the apiKey
  @BeforeInsert()
  @BeforeUpdate()
  generateApiKey(): void {
    if (!this.glabApiKey) this.glabApiKey = this.generateRandomPassword();
    if (!this.gwsCoreProdDbPassword) this.gwsCoreProdDbPassword = this.generateRandomPassword();
    if (!this.gwsCoreDevDbPassword) this.gwsCoreDevDbPassword = this.generateRandomPassword();

    if (this.isOnServer()) {
      if (!this.labManagerApiKey) this.labManagerApiKey = this.generateRandomPassword();
      if (!this.codelabToken) this.codelabToken = this.generateRandomPassword();
    }
  }

  private generateRandomPassword(): string {
    return randomBytes(48).toString('base64').replace(/\W/g, '');
  }

  isRunning(): boolean {
    return this.currentStatus?.status === CnLabInstanceStatus.LAB_RUNNING ?? false;
  }

  serverIsStopped(): boolean {
    return (this.currentStatus?.status === CnLabInstanceStatus.SERVER_STOPPED ?? false) ||
      (this.currentStatus?.status === CnLabInstanceStatus.NO_SERVER ?? false);
  }

  getGlabSpaceApiInfo(): CnExternalApiInfo {
    // specific rule for local development
    if (this.name == 'localhost') {
      return {
        apiKey: '123456',
        apiUrl: 'http://localhost:3000/' + CnLabInstance.SPACE_API_ROUTE
      };
    }
    return {
      apiKey: this.glabApiKey,
      apiUrl: this.glabUrl + '/' + CnLabInstance.SPACE_API_ROUTE
    };
  }

  getLabManagerApiInfo(): CnExternalApiInfo {
    if (this.name == 'localhost') {
      // only for local dev
      return {
        apiKey: '123456',
        apiUrl: 'http://localhost:3080'
      };
    }

    return {
      apiKey: this.labManagerApiKey,
      apiUrl: this.labManagerUrl
    };
  }

  getS3ApiUrl(): string {
    if (this.name == 'localhost') {
      return 'http://localhost:3000/' + CnLabInstance.S3_API_ROUTE;
    }
    return this.glabUrl + '/' + CnLabInstance.S3_API_ROUTE;
  }

  // get the subdomain name
  // ex: if the virtual host is 'rio.gencovery.io', the subdomain record is 'rio'
  public getSubDomainName(): string {
    return this.virtualHost.split('.')[0];
  }

  // get the main domain name
  // ex: if the virtual host is 'rio.gencovery.io', the subdomain record is 'gencovery.io'
  public getMainDomain(): string {
    return this.virtualHost.split('.').slice(1).join('.');
  }

  public isDesktop(): boolean {
    return this.type === CnLabInstanceType.DESKTOP;
  }

  public isCloud(): boolean {
    return this.type === CnLabInstanceType.CLOUD;
  }

  public isOnPremise(): boolean {
    return this.type === CnLabInstanceType.ON_PREMISE;
  }

  /**
   * Return true if the lab is hosted on a server (cloud or on premise)
   */
  public isOnServer(): boolean {
    return this.isCloud() || this.isOnPremise();
  }

  /**
   * Return true if the lab is accessible through http (for cloud and public on premise)
   */
  public isHttpAccessible(): boolean {
    return this.isOnServer();
  }

  public getCloudProviderName(): CnCloudProviderName {
    if (!this.isCloud()) {
      throw new BlBadRequestException('Cannot get cloud provider name for none cloud lab');
    }
    return this.serverCloud.cloudProvider.name;
  }

  public serverIsBusy(): boolean {
    return this.currentStatus.status === CnLabInstanceStatus.SERVER_STARTING ||
      this.currentStatus.status === CnLabInstanceStatus.SERVER_STOPPING;
  }

  public serverTaskIsRunning(): boolean {
    return this.serverTaskStatus === CnLabInstanceServerTaskStatus.RUNNING;
  }

  public setSpace(space: CnSpace): void {
    this.space = space;
    this.spaceId = space.id;
  }
}
