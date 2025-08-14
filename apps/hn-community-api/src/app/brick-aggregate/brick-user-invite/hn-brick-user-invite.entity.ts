import { Entity, ManyToOne } from 'typeorm';

import { HnUserInvite } from '../../core/model/entities/hn-user-invite.class';
import { HnBrick } from '../brick/hn-brick.entity';

@Entity('brick_user_invite')
export class HnBrickUserInvite extends HnUserInvite {
  @ManyToOne(() => HnBrick, { eager: true })
  brick: HnBrick;
}
