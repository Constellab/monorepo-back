import {HnStory, HnStoryCategory, HnStoryStatus} from "./hn-story.entity";
import {HnStoryCoAuthorDto} from '../story-author/hn-story-author.dto';
import {HnUserDto} from '../users/hn-user.dto';
import {HnTopic} from '../topic/hn-topic.entity';
import {BlEntityWithIdDTO} from '@monorepo/back-core-lib';
import {HnFileStory} from '../file-aggregate/file-story/hn-file-story.entity';

export class HnCreateStoryDto {
  title: string;

  category: HnStoryCategory;
}

export class HnStoryFilter {
  categories: string[];
  topics: string[];
  title: string;
}

export class HnStoryDto extends BlEntityWithIdDTO{
  title: string;
  content: Record<string, any>;
  contentEdition?: Record<string, any>;
  firstParagraph?: string;
  mainPicture?: string;
  status: HnStoryStatus;
  category: HnStoryCategory;
  publishedAt: string;
  storyAuthors: HnStoryCoAuthorDto[];
  createdAt: string;
  lastModifiedAt: string;
  storyFiles: HnFileStory[];
  createdBy: HnUserDto;
  topics?: HnTopic[];
  likes: number
  comments: number;

  constructor(story: HnStory) {
    super();
    this.id = story.id;
    this.title = story.title;
    this.content = story.content;
    this.contentEdition = story.contentEdition;
    this.firstParagraph = story.firstParagraph;
    this.mainPicture = story.mainPicture;
    this.status = story.status;
    this.category = story.category;
    this.publishedAt = story.publishedAt?.toISO();
    this.createdAt = story.createdAt?.toISO();
    this.lastModifiedAt = story.lastModifiedAt?.toISO();
    this.createdBy = new HnUserDto(story.createdBy);
    this.likes = story.likes;
    this.comments = story.comments;
    this.topics = story.topics;

    if (story.storyAuthors?.length > 0) {
      this.storyAuthors = [];
      for (const storyAuthor of story.storyAuthors) {
        this.storyAuthors.push(new HnStoryCoAuthorDto(storyAuthor));
      }
    }

  }
}
