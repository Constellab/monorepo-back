import { Entity, ManyToOne } from 'typeorm';

import { HnUserInvite } from '../../core/model/entities/hn-user-invite.class';
import { HnBrick, HnBrickEntity } from '../brick/hn-brick.entity';

@Entity('brick_user_invite')
export class HnBrickUserInvite extends HnUserInvite {
  @ManyToOne(() => HnBrickEntity, { eager: true, nullable: false })
  brick: HnBrick;
}
