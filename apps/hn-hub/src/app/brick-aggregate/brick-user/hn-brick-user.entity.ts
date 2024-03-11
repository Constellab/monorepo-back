import {Entity, ManyToOne} from 'typeorm';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnUser} from '../../users/hn-user.entity';
import {BlEntityWithId} from '@monorepo/back-core-lib';


@Entity('BrickUser')
export class HnBrickUser extends BlEntityWithId {
  @ManyToOne(() => HnBrick, brick => brick.brickUsers)
  brick: HnBrick;

  @ManyToOne(() => HnUser, user => user.brickUsers, {eager: true})
  user: HnUser;

  initBrickUser(brick: HnBrick, user: HnUser): void {
    this.brick = brick;
    this.user = user;
  }
}
