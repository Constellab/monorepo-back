import { Entity, ManyToOne } from 'typeorm';

import { HnUserInvite } from '../../core/model/entities/hn-user-invite.class';
import { HnTagKey } from '../tag-key/hn-tag-key.entity';

@Entity('tag_co_author_invite')
export class HnTagCoAuthorInvite extends HnUserInvite {
  @ManyToOne(() => HnTagKey, { eager: true })
  tagKey: HnTagKey;
}
