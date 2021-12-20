import {BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {CnLab} from '../cn-labs/cn-lab.entity';
import {CnEntityWithStatus} from '../cn-core/model/entities/cn-entity-with-status.entity';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {CnServerInfo} from '../cn-servers-info/cn-server-info.entity';
import {CnLabServerInfo} from '../cn-core/model/config/cn-lab-server-info.class';
import {CnLabInstanceStatus} from './cn-lab-instance-status.enum';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnEntityWithOwner} from '../cn-core/model/entities/cn-entity-with-owner.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

/**
 * A lab instance is a running lab
 */
@Entity('lab_instance')
export class CnLabInstance extends CnEntityWithStatus<CnLabInstanceStatusHistory>
  implements CnLabServerInfo, CnEntityWithOwner {

  @Column({nullable: false, length: 50})
  name: string;

  @BlNotUpdatable()
  @Type(() => CnLab)
  @ManyToOne(() => CnLab, {eager: true, nullable: false})
  lab: CnLab;

  // owner of the lab, can be different than create by
  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  owner: CnUser;

  @Type(() => CnLabInstanceStatusHistory)
  @OneToOne(() => CnLabInstanceStatusHistory, {nullable: true, eager: true})
  @JoinColumn()
  currentStatus: CnLabInstanceStatusHistory;

  // api key shared with the lab instance API
  @Exclude()
  @Column({nullable: false, length: 255})
  apiKey: string;

  // url of the api server
  @Column({nullable: false, length: 255})
  apiUrl: string;

  // url of the front server
  @Column({nullable: false, length: 255})
  frontUrl: string;

  @BlNotUpdatable()
  @Type(() => CnServerInfo)
  @ManyToOne(() => CnServerInfo,
    (serverInfo: CnServerInfo) => serverInfo.labInstances,
    {nullable: false, eager: true})
  serverInfo: CnServerInfo;

  // generate the apiKey
  @BeforeInsert()
  generateApiKey(): void {
    // this.apiKey = crypto.randomBytes(48).toString('base64').replace(/\W/g, '');
    // todo to remove
    this.apiKey = '123456';
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

}
