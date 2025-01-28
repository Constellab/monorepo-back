import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Exclude, Expose, Type } from 'class-transformer';
import { CnLabConfig } from '../cn-lab-configs/cn-lab-config.entity';
import { CnEntityWithStatus } from '../cn-core/model/entities/cn-entity-with-status.entity';
import { CnLabStatusHistory } from './status/cn-lab-status-history.entity';
import { CnServerCloud } from '../cn-servers-info/server-cloud/cn-server-cloud.entity';
import { CnLabServerTaskStatus, CnLabStatus, cnLabStoppedStatuses } from './status/cn-lab-status.enum';
import { randomBytes } from 'crypto';
import { CnExternalApiInfo } from '../cn-core/model/config/cn-config.class';
import { CnSpace, CnSpaceEntity } from '../cn-spaces/cn-space.entity';
import { CnLabUser } from './user/cn-lab-user.entity';
import { BlLuxonDateTimeColumn, BlTrim } from '@monorepo/back-core-lib';
import { CnCloudProviderRegion } from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { DateTime } from 'luxon';
import { ClStringHelper } from '@monorepo/core-lib';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

export enum CnLabType {
  CLOUD = 'CLOUD',
  DESKTOP = 'DESKTOP',
  ON_PREMISE = 'ON_PREMISE', // hosted and managed by the client
}

export enum CnLabBillingMode {
  HOURLY = 'HOURLY',
  MONTHLY = 'MONTHLY',
}

export enum CnLabDesktopPlatform {
  LINUX = 'LINUX',
  WINDOWS = 'WINDOWS',
  MAC = 'MAC',
}

export enum CnLabDomain {
  CONSTELLAB_APP = 'constellab.app',
  GENCOVERY_IO = 'gencovery.io',
}

/**
 * A lab is a running lab
 */
@Entity('lab')
export class CnLabEntity extends CnEntityWithStatus<CnLabStatusHistory> {
  public static readonly SUPPORTED_MAIN_DOMAINS: string[] = [
    CnLabDomain.CONSTELLAB_APP,
    CnLabDomain.GENCOVERY_IO,
  ];
  public static readonly SPACE_API_ROUTE = 'space-api';
  public static readonly S3_API_ROUTE = 's3-server/v1';
  public static readonly CORE_API_ROUTE = 'core-api';

  // relation options to load required information for the bucket
  public static relationFull: FindOptionsRelations<CnLabEntity> = {
    space: true,
    serverCloud: true,
  };

  // relation options to load required information for the bucket
  public static relationSpace: FindOptionsRelations<CnLabEntity> = {
    space: true,
  };

  @BlTrim()
  @Column({ nullable: false, length: 50 })
  name: string;

  // name of the lab used in the cloud provider if the lab is hosted on a cloud
  @BlTrim()
  @Column({ nullable: true, length: 36 })
  cloudName: string;

  @Column({
    type: 'enum',
    enum: CnLabType,
    nullable: false,
  })
  type: CnLabType;

  @Type(() => CnLabConfig)
  @ManyToOne(() => CnLabConfig, { nullable: true })
  labConfig: CnLabConfig;

  @Column({ nullable: true })
  labConfigId?: string;

  @Type(() => CnLabStatusHistory)
  @OneToOne(() => CnLabStatusHistory, {
    nullable: true,
    eager: true,
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  currentStatus: CnLabStatusHistory;

  // api key shared with the prod glab API
  @Exclude()
  @Column({ nullable: false, length: 255, unique: true })
  glabProdApiKey: string;

  // api key shared with the dev glab API
  @Exclude()
  @Column({ nullable: false, length: 255, unique: true })
  glabDevApiKey: string;

  // api key shared with the lab manager APImi
  @Exclude()
  @Column({ nullable: true, length: 255, unique: true })
  labManagerApiKey: string;

  @BlTrim()
  @Column({ nullable: true, length: 255, unique: true })
  virtualHost: string;

  // api key shared with the lab manager API
  @BlTrim()
  @Exclude()
  @Column({ nullable: true, length: 255 })
  codelabToken: string;

  @BlTrim()
  @Exclude()
  @Column({ nullable: false, length: 255 })
  gwsCoreProdDbPassword: string;

  @BlTrim()
  @Exclude()
  @Column({ nullable: false, length: 255 })
  gwsCoreDevDbPassword: string;

  @ManyToOne(() => CnSpaceEntity, { nullable: false })
  space: CnSpace;

  @Column({ nullable: false })
  spaceId?: string;

  @OneToMany(() => CnLabUser, (instanceGroup) => instanceGroup.lab, { cascade: ['insert'] })
  sharedGroups: CnLabUser[];

  @Type(() => CnServerCloud)
  @ManyToOne(() => CnServerCloud, { nullable: true })
  serverCloud: CnServerCloud;

  @ManyToOne(() => CnCloudProviderRegion, { onDelete: 'RESTRICT', eager: true, nullable: true })
  region: CnCloudProviderRegion;

  // id of the ovh, aws, instance
  @Exclude()
  @Column({ nullable: true, length: 255 })
  serverInstanceId: string;

  // id of the ovh, aws, volume
  @Exclude()
  @Column({ nullable: true, length: 255 })
  serverVolumeId: string;

  @Exclude()
  @Column({ nullable: false, default: false })
  dnsConfigured: boolean;

  // text about the current or last server task status
  @Exclude()
  @Column({ type: 'text', nullable: true })
  serverTaskText: string;

  @Exclude()
  @Column({
    type: 'enum',
    enum: CnLabServerTaskStatus,
    nullable: false,
    default: CnLabServerTaskStatus.NONE,
  })
  serverTaskStatus: CnLabServerTaskStatus;

  @Exclude()
  @BlLuxonDateTimeColumn({ nullable: true })
  serverTaskDatetime: DateTime;

  @Column({
    type: 'enum',
    enum: CnLabBillingMode,
    nullable: true,
  })
  billingMode: CnLabBillingMode;

  @Column({
    type: 'enum',
    enum: CnLabDesktopPlatform,
    nullable: true,
  })
  desktopPlatform: CnLabDesktopPlatform;

  @Column({ nullable: false, default: false })
  isFreeLab: boolean;

  // url of the api server
  @Expose()
  get glabUrl(): string {
    return `https://glab.${this.virtualHost}`;
  }

  @Expose()
  get frontUrl(): string {
    return `https://lab.${this.virtualHost}`;
  }

  @Expose()
  get labManagerUrl(): string {
    return `https://lab-manager.${this.virtualHost}`;
  }

  getCodelabUrl(): string {
    return `https://codelab.${this.virtualHost}/?folder=/lab/user`;
  }

  getCodelabUsername(): string {
    return 'codelab';
  }

  // generate the apiKey
  @BeforeInsert()
  @BeforeUpdate()
  generateApiKey(): void {
    if (!this.glabProdApiKey) this.glabProdApiKey = this.generateRandomPassword();
    if (!this.glabDevApiKey) this.glabDevApiKey = this.generateRandomPassword();
    if (!this.gwsCoreProdDbPassword) this.gwsCoreProdDbPassword = this.generateRandomPassword();
    if (!this.gwsCoreDevDbPassword) this.gwsCoreDevDbPassword = this.generateRandomPassword();
    if (!this.labManagerApiKey) this.labManagerApiKey = this.generateRandomPassword();

    if (this.isOnServer()) {
      if (!this.codelabToken) this.codelabToken = this.generateRandomPassword();
    }

    if (this.isCloud()) {
      if (!this.cloudName) this.cloudName = ClStringHelper.generateUUID();
    }
  }

  private generateRandomPassword(): string {
    return randomBytes(48).toString('base64').replace(/\W/g, '');
  }

  isRunning(): boolean {
    return this.currentStatus?.status === CnLabStatus.LAB_RUNNING ?? false;
  }

  serverIsStopped(): boolean {
    if (this.currentStatus == null) return false;
    return cnLabStoppedStatuses.includes(this.currentStatus?.status);
  }

  getGlabSpaceApiInfo(): CnExternalApiInfo {
    // specific rule for local development
    if (this.name == 'localhost') {
      return {
        apiKey: '123456',
        apiUrl: 'http://localhost:3000/' + CnLabEntity.SPACE_API_ROUTE,
      };
    }
    return {
      apiKey: this.glabProdApiKey,
      apiUrl: this.glabUrl + '/' + CnLabEntity.SPACE_API_ROUTE,
    };
  }

  getLabManagerApiInfo(): CnExternalApiInfo {
    if (this.name == 'localhost') {
      // only for local dev
      return {
        apiKey: '123456',
        apiUrl: 'http://localhost:3080',
      };
    }

    return {
      apiKey: this.labManagerApiKey,
      apiUrl: this.labManagerUrl,
    };
  }

  getS3ApiUrl(): string {
    if (this.name == 'localhost') {
      return 'http://localhost:3000/' + CnLabEntity.S3_API_ROUTE;
    }
    return this.glabUrl + '/' + CnLabEntity.S3_API_ROUTE;
  }

  // get the subdomain name
  // ex: if the virtual host is 'rio.gencovery.io', the subdomain is 'rio'
  public getSubDomainName(): string {
    return this.virtualHost.split('.')[0];
  }

  // get the main domain name
  // ex: if the virtual host is 'rio.gencovery.io', the main domain is 'gencovery.io'
  public getMainDomain(): string {
    const virtualHost = this.getVirtualHostWithoutPort();
    return virtualHost.split('.').slice(1).join('.');
  }

  private getVirtualHostWithoutPort(): string {
    return this.virtualHost.split(':')[0];
  }

  public domainIncludesPort(): boolean {
    return this.virtualHost.includes(':');
  }

  public isDesktop(): boolean {
    return this.type === CnLabType.DESKTOP;
  }

  public isCloud(): boolean {
    return this.type === CnLabType.CLOUD;
  }

  public isOnPremise(): boolean {
    return this.type === CnLabType.ON_PREMISE;
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

  /**
   * return true if the lab is on a constellab standard domain
   */
  public isConstellabDomain(): boolean {
    if (this.isDesktop()) return false;
    return CnLabEntity.SUPPORTED_MAIN_DOMAINS.includes(this.getMainDomain());
  }

  public serverIsBusy(): boolean {
    return (
      this.currentStatus.status === CnLabStatus.SERVER_STARTING ||
      this.currentStatus.status === CnLabStatus.SERVER_STOPPING
    );
  }

  public serverTaskIsRunning(): boolean {
    return this.serverTaskStatus === CnLabServerTaskStatus.RUNNING;
  }

  public setSpace(space: CnSpace): void {
    this.space = space;
    this.spaceId = space.id;
  }
}

export type CnLabFull = Omit<CnLabEntity, 'labConfig' | 'sharedGroups'>;
export type CnLabWithSpace = Omit<CnLabFull, 'serverCloud'>;
export type CnLab = Omit<CnLabWithSpace, 'space'>;
