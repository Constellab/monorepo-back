import {Column, Entity, ManyToMany} from 'typeorm';
import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnStory} from '../story/hn-story.entity';


//TODO: Rename to HnStoryTopic
@Entity('topic')
export class HnTopic extends BlEntityWithId {
  @Column()
  name: string;

  @ManyToMany(() => HnStory, story => story.topics, {nullable: true})
  stories?: HnStory[];

  @Column({nullable: true})
  popularityIndex?: number;
}
