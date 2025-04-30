import { Entity, ManyToOne } from 'typeorm';
import { HnStory } from '../../story/hn-story.entity';
import { HnAbstractFileEntity } from '../file-core/hn-abstract-file.entity';

@Entity('file_story')
export class HnFileStory extends HnAbstractFileEntity<HnStory> {
  @ManyToOne(() => HnStory, { nullable: false, onDelete: 'CASCADE' })
  entity: HnStory;
}
