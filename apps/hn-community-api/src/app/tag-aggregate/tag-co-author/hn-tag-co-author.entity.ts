import { BlEntityWithId } from '@monorepo/back-core-lib';
import { Entity, ManyToOne } from 'typeorm';

import { HnUser } from '../../users/hn-user.entity';
import { HnTagKey } from '../tag-key/hn-tag-key.entity';

@Entity('tag_co_author')
export class HnTagCoAuthor extends BlEntityWithId {
  @ManyToOne(() => HnTagKey, (tagKey) => tagKey.tagCoAuthors, { nullable: false })
  tagKey: HnTagKey;

  @ManyToOne(() => HnUser, { eager: true, onDelete: 'CASCADE', nullable: false })
  user: HnUser;
}
