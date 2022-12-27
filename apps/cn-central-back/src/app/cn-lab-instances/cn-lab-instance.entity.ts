import {BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from 'typeorm';
import {Exclude, Expose, Type} from 'class-transformer';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnEntityWithStatus} from '../cn-core/model/entities/cn-entity-with-status.entity';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {CnServerInfo} from '../cn-servers-info/cn-server-info.entity';
import {CnLabInstanceStatus} from './status/cn-lab-instance-status.enum';
import {randomBytes} from 'crypto';
import {CnExternalApiInfo} from '../cn-core/model/config/cn-config.class';
import {CnCity} from '../cn-city/cn-city.entity';
import {CnSpace} from '../cn-spaces/cn-space.entity';
import {CnLabInstanceUser} from './user/cn-lab-instance-user.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';


/**
 * A lab instance is a running lab
 */
@Entity('lab_instance')
export class CnLabInstance extends CnEntityWithStatus<CnLabInstanceStatusHistory> {

  @Column({nullable: false, length: 50})
  name: string;

  @Type(() => CnLabConfig)
  @ManyToOne(() => CnLabConfig, {nullable: true})
  labConfig: CnLabConfig;

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

  // api key shared with the lab manager API
  @Exclude()
  @Column({nullable: false, length: 255})
  labManagerApiKey: string;

  @Column({nullable: false, length: 255})
  virtualHost: string;

  // api key shared with the lab manager API
  @Exclude()
  @Column({nullable: false, length: 255})
  codelabToken: string;

  @BlNotUpdatable()
  @ManyToOne(() => CnSpace, {nullable: false})
  space: CnSpace;

  @Column({nullable: false, update: false})
  spaceId?: string;

  @OneToMany(() => CnLabInstanceUser,
    (instanceGroup) => instanceGroup.labInstance,
    {cascade: ['insert']})
  sharedGroups: CnLabInstanceUser[];

  @Type(() => CnServerInfo)
  @ManyToOne(() => CnServerInfo,
    (serverInfo: CnServerInfo) => serverInfo.labInstances,
    {nullable: false, eager: true})
  serverInfo: CnServerInfo;

  @ManyToOne(() => CnCity, {onDelete: 'RESTRICT', eager: true})
  city: CnCity;

  // id of the ovh, aws, instance
  @Column({nullable: true, length: 255})
  serverInstanceId: string

  // id of the ovh, aws, volume
  @Column({nullable: true, length: 255})
  serverVolumeId: string;


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
    if (!this.glabApiKey) {
      this.glabApiKey = randomBytes(48).toString('base64').replace(/\W/g, '');
    }
    if (!this.labManagerApiKey) {
      this.labManagerApiKey = randomBytes(48).toString('base64').replace(/\W/g, '');
    }
    if (!this.codelabToken) {
      this.codelabToken = randomBytes(48).toString('base64').replace(/\W/g, '');
    }
  }

  isRunning(): boolean {
    return this.currentStatus?.status === CnLabInstanceStatus.RUNNING ?? false;
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

  public getSubDomainDsnRecord(): string {
    return '*.' + this.virtualHost.split('.')[0];
  }
}
