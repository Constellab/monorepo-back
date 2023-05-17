import {Column, Entity, ManyToOne} from 'typeorm';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnUser} from '../../users/hn-user.entity';
import {BlEntityWithId} from '@monorepo/back-core-lib';

export enum HnBrickUserStatus {
  CREATOR = 'CREATOR',
  SIMPLE_USER = 'SIMPLE_USER'
}


@Entity('BrickUser')
export class HnBrickUser extends BlEntityWithId {

  @Column('enum', {enum: HnBrickUserStatus})
  status: HnBrickUserStatus

  @ManyToOne(() => HnBrick, brick => brick.brickUsers)
  brick: HnBrick;

  @ManyToOne(() => HnUser, user => user.brickUsers, {eager: true})
  user: HnUser;

  initBrickUser(brick: HnBrick, user: HnUser, status: HnBrickUserStatus): void {
    this.brick = brick;
    this.user = user;
    this.status = status;
  }
}
