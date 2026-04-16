import { BlEntityWithId } from '@monorepo/back-core-lib';
import { Entity, ManyToOne } from 'typeorm';

import { HnUser } from '../../users/hn-user.entity';
import { HnCommunityApp, HnCommunityAppEntity } from '../community-app/hn-community-app.entity';

@Entity('app_user')
export class HnCommunityAppUser extends BlEntityWithId {
  @ManyToOne(() => HnCommunityAppEntity, (app) => app.appUsers, { nullable: false })
  app: HnCommunityApp;

  @ManyToOne(() => HnUser, { eager: true, onDelete: 'CASCADE', nullable: false })
  user: HnUser;

  initAppUser(brick: HnCommunityApp, user: HnUser): void {
    this.app = brick;
    this.user = user;
  }
}
