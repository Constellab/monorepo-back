import {BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany} from 'typeorm';
import {HnTopic} from '../topic/hn-topic.entity';
import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {HnUser} from '../users/hn-user.entity';
import {ClDateHelper, ClStringHelper} from '@monorepo/core-lib';
import {HnStoryCoAuthor} from '../story-author/hn-story-author.entity';
import {Expose, Type} from 'class-transformer';
import {HnStoryFile} from '../story-file/hn-story-file.entity';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';

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

@Entity('story')
export class HnStory extends BlEntityWithId {
  @Column()
  title: string;

  // the database was modified to use a long text instead of a json
  @Column({name: 'content', type: 'simple-json'})
  content: Record<string, any>;

  @Column({name: 'content_edition', type: 'simple-json', nullable: true})
  contentEdition?: Record<string, any>;

  @Column({name: 'content_backup', type: 'simple-json', nullable: true})
  contentBackup?: Record<string, any>;

  @Column({nullable: true, type: 'varchar'})
  firstParagraph?: string;

  @Column({nullable: true})
  mainPicture?: string;

  @ManyToMany(() => HnTopic, topic => topic.stories, {nullable: true})
  @JoinTable()
  topics?: HnTopic[];

  @Column({type: 'enum', enum: HnStoryStatus, default: HnStoryStatus.DRAFT})
  status: HnStoryStatus;

  @Column({type: 'enum', enum: HnStoryCategory, default: HnStoryCategory.ARTICLE})
  category: HnStoryCategory;

  @BlLuxonDateTimeColumn({nullable: true})
  publishedAt: DateTime;

  @OneToMany(() => HnStoryCoAuthor, storyAuthor => storyAuthor.story, {nullable: true})
  storyAuthors: HnStoryCoAuthor[];

  @BlLuxonDateTimeColumn({nullable: true, update: false})
  createdAt: DateTime;

  @BlLuxonDateTimeColumn({nullable: true})
  lastModifiedAt: DateTime;

  @OneToMany(() => HnStoryFile, storyFile => storyFile.story, {nullable: true, eager: true})
  storyFiles: HnStoryFile[];

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, {eager: true, nullable: true})
  createdBy: HnUser;

  @Column({default: 0})
  likes: number;

  @Column({default: 0})
  comments: number;

  @BeforeInsert()
  setCreatedDate(): void {
    this.createdBy = HnCurrentUserHelper.getCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedDate(): void {
    this.lastModifiedAt = ClDateHelper.getDate();
  }

  /**
   * Path use in the url to have an explicit url (this is not mandatory to find the story)
   */
  @Expose()
  get titlePath(): string {
    return ClStringHelper.getCleanUrlPath(this.title);
  }
}
