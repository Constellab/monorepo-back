import { BlEntityWithId } from '@monorepo/back-core-lib';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { HnTagKey } from '../tag-key/hn-tag-key.entity';

@Unique(['value', 'tagKey'])
@Entity('tag_value')
export class HnTagValue extends BlEntityWithId {
  @Column({ update: false })
  value!: string;

  @Column()
  deprecated!: boolean;

  @Column({ nullable: true, type: 'varchar' })
  shortDescription!: string | null;

  @Column({ nullable: true, type: 'simple-json' })
  additionalInfos!: Record<string, any> | null;

  @ManyToOne(() => HnTagKey, (tagKey) => tagKey, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  tagKey!: HnTagKey;
}
