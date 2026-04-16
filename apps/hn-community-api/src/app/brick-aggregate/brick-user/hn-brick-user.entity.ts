import { BlEntityWithId } from '@monorepo/back-core-lib';
import { Entity, ManyToOne } from 'typeorm';

import { HnUser } from '../../users/hn-user.entity';
import { HnBrick, HnBrickEntity } from '../brick/hn-brick.entity';

@Entity('brick_user')
export class HnBrickUser extends BlEntityWithId {
  @ManyToOne(() => HnBrickEntity, { nullable: false })
  brick: HnBrick;

  @ManyToOne(() => HnUser, { eager: true, onDelete: 'CASCADE', nullable: false })
  user: HnUser;

  initBrickUser(brick: HnBrick, user: HnUser): void {
    this.brick = brick;
    this.user = user;
  }
}
