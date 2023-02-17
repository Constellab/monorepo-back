import {Column, Entity, ManyToOne} from 'typeorm';
import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnStory} from '../story/hn-story.entity';
import {HnUser} from '../users/hn-user.entity';

export enum HnStoryAuthorStatus {
  COAUTHOR = 'COAUTHOR',

  AUTHOR = 'AUTHOR'
}

@Entity('StoryAuthor')
export class HnStoryAuthor extends BlEntityWithId {

  @Column('enum', {enum: HnStoryAuthorStatus})
  status: HnStoryAuthorStatus

  @ManyToOne(() => HnStory, story => story.storyAuthors)
  story: HnStory;

  @ManyToOne(() => HnUser, user => user.storyAuthors, {eager: true})
  user: HnUser;

  initAuthor(story: HnStory, user: HnUser): void {
    this.story = story;
    this.user = user;
    this.status = HnStoryAuthorStatus.AUTHOR;
  }

}
