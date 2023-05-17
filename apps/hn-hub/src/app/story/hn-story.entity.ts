import {BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany} from 'typeorm';
import {CmRichText, CmRichTextI} from '@monorepo/common-model';
import {HnTopic} from '../topic/hn-topic.entity';
import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {HnUser} from '../users/hn-user.entity';
import {ClDateHelper} from '@monorepo/core-lib';
import {HnStoryAuthor} from '../story-author/hn-story-author.entity';

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
export class HnStory extends BlEntityWithId{
  @Column()
  title: string;

  @Column({name: 'content', type: 'simple-json'})
  content: Record<string, any> = CmRichText.newRichText();

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

  init(title: string, content: CmRichTextI, labels: HnTopic[]): void {
    this.content = content;
    this.title = title;
    this.topics = labels;
  }
}
