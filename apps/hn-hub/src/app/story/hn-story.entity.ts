import {BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany} from 'typeorm';
import {HnTopic} from '../topic/hn-topic.entity';
import {BlEntityWithId, BlLuxonDateTimeColumn, BlRichText, BlRichTextI} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {HnUser} from '../users/hn-user.entity';
import {ClDateHelper, ClStringHelper} from '@monorepo/core-lib';
import {HnStoryAuthor} from '../story-author/hn-story-author.entity';
import {Expose} from 'class-transformer';
import {HnStoryFile} from '../story-file/hn-story-file.entity';

export enum HnStoryStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum HnStoryCategory {
  DOCUMENTATION = 'DOCUMENTATION',
  PRODUCT_DOCUMENTATION = 'PRODUCT_DOCUMENTATION',
  USE_CASE = 'USE_CASE',
  ARTICLE = 'ARTICLE'
}

@Entity('Story')
export class HnStory extends BlEntityWithId {
  @Column()
  title: string;

  // the database was modified to use a long text instead of a json
  @Column({name: 'content', type: 'simple-json'})
  content: Record<string, any> = BlRichText.newRichText();

  @Column({nullable: true, type: 'varchar'})
  firstParagraph?: string;

  @Column({nullable: true})
  mainPicture?: string;

  @ManyToMany(() => HnTopic, topic => topic.stories, {nullable: true, eager: true})
  @JoinTable()
  topics?: HnTopic[];

  @Column({type: 'enum', enum: HnStoryStatus, default: HnStoryStatus.DRAFT})
  status: HnStoryStatus;

  @Column({type: 'enum', enum: HnStoryCategory, default: HnStoryCategory.ARTICLE})
  category: HnStoryCategory;

  @BlLuxonDateTimeColumn({nullable: true})
  publishedAt: DateTime;

  @OneToMany(() => HnStoryAuthor, storyAuthor => storyAuthor.story, {nullable: true, eager: true})
  storyAuthors: HnStoryAuthor[];

  @BlLuxonDateTimeColumn({nullable: true, update: false})
  createdAt: DateTime;

  @BlLuxonDateTimeColumn({nullable: true})
  lastModifiedAt: DateTime;

  @OneToMany(() => HnStoryFile, storyFile => storyFile.story, {nullable: true, eager: true})
  storyFiles: HnStoryFile[];

  @BeforeInsert()
  setCreatedDate(): void {
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedDate(): void {
    this.lastModifiedAt = ClDateHelper.getDate();
  }

  getAuthor(): HnUser {
    return this.storyAuthors[0].user;
  }

  init(title: string, content: BlRichTextI, labels: HnTopic[]): void {
    this.content = content;
    this.title = title;
    this.topics = labels;
  }

  /**
   * Path use in the url to have an explicit url (this is not mandatory to find the story)
   */
  @Expose()
  get titlePath(): string{
    return ClStringHelper.generateUrlPathFromString(this.title)
  }
}
