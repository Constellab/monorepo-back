import { Entity, ManyToOne } from 'typeorm';
import { HnUser } from '../../users/hn-user.entity';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { HnCommunityApp, HnCommunityAppEntity } from '../community-app/hn-community-app.entity';

@Entity('app_user')
export class HnCommunityAppUser extends BlEntityWithId {
  @ManyToOne(() => HnCommunityAppEntity, (app) => app.appUsers)
  app: HnCommunityApp;

  @ManyToOne(() => HnUser, (user) => user.brickUsers, { eager: true })
  user: HnUser;

  initAppUser(brick: HnCommunityApp, user: HnUser): void {
    this.app = brick;
    this.user = user;
  }
}
