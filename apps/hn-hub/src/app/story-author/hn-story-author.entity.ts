import {Entity, ManyToOne} from 'typeorm';
import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnStory} from '../story/hn-story.entity';
import {HnUser} from '../users/hn-user.entity';


@Entity('story_co_author')
export class HnStoryCoAuthor extends BlEntityWithId {

  @ManyToOne(() => HnStory, story => story.storyAuthors)
  story: HnStory;

  @ManyToOne(() => HnUser, user => user.storyAuthors, {eager: true})
  user: HnUser;

  initAuthor(story: HnStory, user: HnUser): void {
    this.story = story;
    this.user = user;
  }
}
