import { Entity, ManyToOne } from 'typeorm';
import { HnUser } from '../../users/hn-user.entity';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { HnCommunityAppEntity } from '../community-app/hn-community-app.entity';

@Entity('app_user')
export class HnCommunityAppUser extends BlEntityWithId {
  @ManyToOne(() => HnCommunityAppEntity, (app) => app.appUsers)
  app: HnCommunityAppEntity;

  @ManyToOne(() => HnUser, (user) => user.brickUsers, { eager: true })
  user: HnUser;

  initAppUser(brick: HnCommunityAppEntity, user: HnUser): void {
    this.app = brick;
    this.user = user;
  }
}
