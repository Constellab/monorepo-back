import {BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {Lab} from '../labs/lab.entity';
import {EntityWithStatus} from '../core/model/entities/entity-with-status.entity';
import {LabInstanceStatusHistory} from './lab-instance-status-history.entity';
import {ServerInfo} from '../servers-info/server-info.entity';
import {LabServerInfo} from '../core/model/config/lab-server-info.class';
import {LabInstanceStatus} from './lab-instance-status.enum';
import {User} from '../users/user.entity';
import {EntityWithOwner} from '../core/model/entities/entity-with-owner.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

/**
 * A lab instance is a running lab
 */
@Entity()
export class LabInstance extends EntityWithStatus<LabInstanceStatusHistory>
  implements LabServerInfo, EntityWithOwner {

  @Column({nullable: false, length: 50})
  name: string;

  @BlNotUpdatable()
  @Type(() => Lab)
  @ManyToOne(() => Lab, {eager: true, nullable: false})
  lab: Lab;

  // owner of the lab, can be different than create by
  @Type(() => User)
  @ManyToOne(() => User, {eager: true, nullable: false})
  owner: User;

  @Type(() => LabInstanceStatusHistory)
  @OneToOne(() => LabInstanceStatusHistory, {nullable: true, eager: true})
  @JoinColumn()
  currentStatus: LabInstanceStatusHistory;

  // api key shared with the lab instance API
  @Exclude()
  @Column({nullable: false, length: 80})
  apiKey: string;

  // url of the api server
  @Column({nullable: false, length: 255})
  apiUrl: string;

  // url of the front server
  @Column({nullable: false, length: 255})
  frontUrl: string;

  @BlNotUpdatable()
  @Type(() => ServerInfo)
  @ManyToOne(() => ServerInfo,
    (serverInfo: ServerInfo) => serverInfo.labInstances,
    {nullable: false, eager: true})
  serverInfo: ServerInfo;

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
    return this.currentStatus?.status === LabInstanceStatus.RUNNING ?? false;
  }

  getOwner(): User {
    return this.owner;
  }

}
