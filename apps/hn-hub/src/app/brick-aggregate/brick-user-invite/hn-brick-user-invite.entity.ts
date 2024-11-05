import { Column, Entity, ManyToOne } from 'typeorm';
import { HnBaseEntity } from '../../core/model/entities/hn-base.entity';
import { HnInviteStatus } from '../../core/model/config/hn-invite-status.enum';
import { HnBrick } from '../brick/hn-brick.entity';
import { Expose } from 'class-transformer';

@Entity('brick_user_invite')
export class HnBrickUserInvite extends HnBaseEntity {
  @Column()
  email: string;

  @Column('enum', { enum: HnInviteStatus, default: HnInviteStatus.PENDING })
  status: HnInviteStatus = HnInviteStatus.PENDING;

  @ManyToOne((type) => HnBrick, { eager: true })
  brick: HnBrick;

  @Expose()
  @Column('uuid')
  token: string;
}
