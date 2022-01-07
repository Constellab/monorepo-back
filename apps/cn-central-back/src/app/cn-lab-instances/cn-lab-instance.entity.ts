import {BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Exclude, Expose, Type} from 'class-transformer';
import {CnLab} from '../cn-labs/cn-lab.entity';
import {CnEntityWithStatus} from '../cn-core/model/entities/cn-entity-with-status.entity';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {CnServerInfo} from '../cn-servers-info/cn-server-info.entity';
import {CnLabInstanceStatus} from './cn-lab-instance-status.enum';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnEntityWithOwner} from '../cn-core/model/entities/cn-entity-with-owner.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {randomBytes} from 'crypto';
import {CnExternalApiInfo} from '../cn-core/model/config/cn-config.class';


/**
 * A lab instance is a running lab
 */
@Entity('lab_instance')
export class CnLabInstance extends CnEntityWithStatus<CnLabInstanceStatusHistory> implements CnEntityWithOwner {

  @Column({nullable: false, length: 50})
  name: string;

  @BlNotUpdatable()
  @Type(() => CnLab)
  @ManyToOne(() => CnLab, {eager: true, nullable: false})
  lab: CnLab;

  // owner of the lab, can be different from create by
  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  owner: CnUser;

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

  @BlNotUpdatable()
  @Type(() => CnServerInfo)
  @ManyToOne(() => CnServerInfo,
    (serverInfo: CnServerInfo) => serverInfo.labInstances,
    {nullable: false, eager: true})
  serverInfo: CnServerInfo;

  // generate the apiKey
  @BeforeInsert()
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
    if (!this.name) {
      this.name = this.lab.label;
    }
  }

  isRunning(): boolean {
    return this.currentStatus?.status === CnLabInstanceStatus.RUNNING ?? false;
  }

  getOwner(): CnUser {
    return this.owner;
  }

  getGlabApiInfo(): CnExternalApiInfo {
    return {
      apiKey: this.glabApiKey,
      apiUrl: this.glabUrl
    };
  }

  getLabManagerApiInfo(): CnExternalApiInfo {
    return {
      apiKey: this.labManagerApiKey,
      apiUrl: this.labManagerUrl
    };
  }

}
