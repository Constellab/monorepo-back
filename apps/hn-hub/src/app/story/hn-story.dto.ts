import { HnStory, HnStoryStatus } from './hn-story.entity';
import { HnStoryCoAuthorDto } from '../story-author/hn-story-author.dto';
import { HnUserDto } from '../users/hn-user.dto';
import { HnTopic } from '../topic/hn-topic.entity';
import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

export class HnCreateStoryDto {
  title: string;
}

export class HnStoryFilter {
  topics: string[];
  title: string;
}

export class HnStoryDto extends BlEntityWithIdDTO {
  title: string;
  content: TeRichTextDTO;
  contentEdition: TeRichTextDTO;
  firstParagraph?: string;
  mainPicture?: string;
  status: HnStoryStatus;
  publishedAt: string;
  storyAuthors: HnStoryCoAuthorDto[];
  createdAt: string;
  lastModifiedAt: string;
  createdBy: HnUserDto;
  topics?: HnTopic[];
  likes: number;
  comments: number;

  constructor(story: HnStory) {
    super();
    this.id = story.id;
    this.title = story.title;
    this.content = story.getContentRichText().toJson();
    this.contentEdition = story.getContentEditionRichText().toJson();
    this.firstParagraph = story.firstParagraph;
    this.mainPicture = story.mainPicture;
    this.status = story.status;
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
