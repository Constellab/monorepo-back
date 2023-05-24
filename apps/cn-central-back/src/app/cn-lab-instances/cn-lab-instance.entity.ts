import {BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from 'typeorm';
import {Exclude, Expose, Type} from 'class-transformer';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnEntityWithStatus} from '../cn-core/model/entities/cn-entity-with-status.entity';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {CnServerInfo} from '../cn-servers-info/cn-server-info.entity';
import {CnLabInstanceStatus} from './status/cn-lab-instance-status.enum';
import {randomBytes} from 'crypto';
import {CnExternalApiInfo} from '../cn-core/model/config/cn-config.class';
import {CnSpace} from '../cn-spaces/cn-space.entity';
import {CnLabInstanceUser} from './user/cn-lab-instance-user.entity';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnCloudProviderName} from '../cn-cloud-providers/cn-cloud-provider.entity';

export enum CnLabInstanceType {
  CLOUD = 'CLOUD',
  ON_PREMISE = 'ON_PREMISE'
}

export enum CnLabInstanceBillingMode {
  HOURLY = 'HOURLY',
  MONTHLY = 'MONTHLY'
}

export enum CnLabInstanceVolumeType {
  CLASSIC = 'CLASSIC',
  HIGH_SPEED = 'HIGH_SPEED'
}

export enum CnLabOnPremisePlatform {
  LINUX = 'LINUX',
  WINDOWS = 'WINDOWS',
  MAC = 'MAC'
}

/**
 * A lab instance is a running lab
 */
@Entity('lab_instance')
export class CnLabInstance extends CnEntityWithStatus<CnLabInstanceStatusHistory> {

  @Column({nullable: false, length: 50, unique: true})
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
    onUpdate: 'CASCADE', onDelete: 'CASCADE'
  })
  @JoinColumn()
  currentStatus: CnLabInstanceStatusHistory;

  // api key shared with the glab instance API
  @Exclude()
  @Column({nullable: false, length: 255})
  glabApiKey: string;

  // api key shared with the lab manager APImi
  @Exclude()
  @Column({nullable: true, length: 255})
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

  @Type(() => CnServerInfo)
  @ManyToOne(() => CnServerInfo,
    (serverInfo: CnServerInfo) => serverInfo.labInstances,
    {nullable: true, eager: true})
  serverInfo: CnServerInfo;

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

  // text about the current server status
  @Exclude()
  @Column({type: 'text', nullable: true})
  serverProgressText: string;

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
    type: 'enum', enum: CnLabOnPremisePlatform, nullable: true,
  })
  onPremisePlatform: CnLabOnPremisePlatform;

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

    if (this.type === CnLabInstanceType.CLOUD) {
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

  getGlabApiInfo(): CnExternalApiInfo {
    return {
      apiKey: this.glabApiKey,
      apiUrl: this.glabUrl
    };
    // only for local dev
    // return {
    //   apiKey: '123456',
    //   apiUrl: 'http://localhost:3000'
    // };
  }


  getLabManagerApiInfo(): CnExternalApiInfo {
    return {
      apiKey: this.labManagerApiKey,
      apiUrl: this.labManagerUrl
    };
    // only for local dev
    // return {
    //   apiKey: '123456',
    //   apiUrl: 'http://localhost:3080'
    // };
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

  public isOnPremise(): boolean {
    return this.type === CnLabInstanceType.ON_PREMISE;
  }

  public isCloud(): boolean {
    return this.type === CnLabInstanceType.CLOUD;
  }

  public getCloudProviderName(): CnCloudProviderName {
    if (this.isOnPremise()) {
      throw new BlBadRequestException('Cannot get cloud provider name for on premise instance');
    }
    return this.serverInfo.cloudProvider.name;
  }

  public serverIsBusy(): boolean {
    return this.currentStatus.status === CnLabInstanceStatus.SERVER_STARTING ||
      this.currentStatus.status === CnLabInstanceStatus.SERVER_STOPPING;
  }

  public setSpace(space: CnSpace): void {
    this.space = space;
    this.spaceId = space.id;
  }
}
