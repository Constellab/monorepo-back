import {Column, Entity, ManyToMany} from 'typeorm';
import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnStory} from '../story/hn-story.entity';


//TODO: Rename to HnStoryTopic
@Entity('label')
export class HnLabel extends BlEntityWithId {
  @Column()
  name: string;

  @ManyToMany(() => HnStory, story => story.labels)
  stories: HnStory[];
}
