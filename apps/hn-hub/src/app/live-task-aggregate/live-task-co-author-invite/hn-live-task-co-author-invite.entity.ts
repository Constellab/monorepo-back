import {Column, Entity, ManyToOne} from 'typeorm';
import {HnLiveTask} from '../live-task/hn-live-task.entity';
import {HnInviteStatus} from '../../core/model/config/hn-invite-status.enum';
import {Expose} from 'class-transformer';
import {HnBaseEntity} from '../../core/model/entities/hn-base.entity';

;

@Entity('LiveTaskCoAuthorInvite')
export class HnLiveTaskCoAuthorInvite extends HnBaseEntity {

  @Column()
  email: string;

  @Column('enum', {enum: HnInviteStatus, default: HnInviteStatus.PENDING})
  status: HnInviteStatus = HnInviteStatus.PENDING;

  @ManyToOne(type => HnLiveTask, {eager: true})
  liveTask: HnLiveTask;

  @Expose()
  @Column('uuid')
  token: string;
}
