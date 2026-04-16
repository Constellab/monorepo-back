import { BlEntityWithId } from '@monorepo/back-core-lib';
import { Entity, ManyToOne } from 'typeorm';

import { HnUser } from '../../users/hn-user.entity';
import { HnCommunityApp, HnCommunityAppEntity } from '../community-app/hn-community-app.entity';

@Entity('app_co_author')
export class HnCommunityAppCoAuthor extends BlEntityWithId {
  @ManyToOne(() => HnCommunityAppEntity, (agent) => agent.communityAppCoAuthors, { nullable: false })
  communityApp: HnCommunityApp;

  @ManyToOne(() => HnUser, { eager: true, onDelete: 'CASCADE', nullable: false })
  user: HnUser;

  initCoAuthor(communityApp: HnCommunityAppEntity, user: HnUser): void {
    this.communityApp = communityApp;
    this.user = user;
  }
}
