import { Entity, ManyToOne } from 'typeorm';

import { HnUserInvite } from '../../core/model/entities/hn-user-invite.class';
import { HnCommunityApp, HnCommunityAppEntity } from '../community-app/hn-community-app.entity';

@Entity('app_co_author_invite')
export class HnCommunityAppCoAuthorInvite extends HnUserInvite {
  @ManyToOne(() => HnCommunityAppEntity, { eager: true, nullable: false })
  communityApp: HnCommunityApp;
}
