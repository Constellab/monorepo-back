import { Column, Entity, ManyToOne } from 'typeorm';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { HnStory } from '../story/hn-story.entity';

@Entity('story_file')
export class HnStoryFile extends BlEntityWithId {
  @Column()
  humanName: string;

  @Column()
  fileName: string;

  @ManyToOne(() => HnStory, { nullable: false })
  story: HnStory;

  initFile(story: HnStory, humanName: string, fileName: string): void {
    this.story = story;
    this.humanName = humanName;
    this.fileName = fileName;
  }
}
