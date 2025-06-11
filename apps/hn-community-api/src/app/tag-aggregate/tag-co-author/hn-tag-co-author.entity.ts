import { Entity, ManyToOne } from 'typeorm';
import { HnTagKey } from '../tag-key/hn-tag-key.entity';
import { HnUser } from '../../users/hn-user.entity';
import { BlEntityWithId } from '@monorepo/back-core-lib';

@Entity('tag_co_author')
export class HnTagCoAuthor extends BlEntityWithId {
  @ManyToOne(() => HnTagKey, (tagKey) => tagKey.tagCoAuthors)
  tagKey: HnTagKey;

  @ManyToOne(() => HnUser, (user) => user.tagCoAuthors, { eager: true })
  user: HnUser;
}
