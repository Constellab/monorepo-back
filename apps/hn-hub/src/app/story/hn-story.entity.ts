import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { HnTopic } from '../topic/hn-topic.entity';
import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { HnUser } from '../users/hn-user.entity';
import { ClDateHelper, ClStringHelper } from '@monorepo/core-lib';
import { HnStoryCoAuthor } from '../story-author/hn-story-author.entity';
import { Expose, Type } from 'class-transformer';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import {
  TeRichText,
  TeRichTextAggregate,
  TeRichTextDTO,
  TeRichTextModifications,
} from '@monorepo/te-text-editor';

export enum HnStoryStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum HnStoryCategory {
  DOCUMENTATION = 'DOCUMENTATION',
  PRODUCT_DOCUMENTATION = 'PRODUCT_DOCUMENTATION',
  USE_CASE = 'USE_CASE',
  ARTICLE = 'ARTICLE',
}

@Entity('story')
export class HnStory extends BlEntityWithId {
  @Column()
  title: string;

  // the database was modified to use a long text instead of a json
  @Column({ name: 'content', type: 'simple-json' })
  content: TeRichTextDTO;

  @Column({ name: 'content_edition', type: 'simple-json', nullable: true })
  contentEdition?: TeRichTextDTO;

  @Column({ type: 'longtext', nullable: true })
  modifications: string;

  @Column({ nullable: true, type: 'varchar' })
  firstParagraph?: string;

  @Column({ nullable: true })
  mainPicture?: string;

  @ManyToMany(() => HnTopic, (topic) => topic.stories, { nullable: true })
  @JoinTable()
  topics?: HnTopic[];

  @Column({ type: 'enum', enum: HnStoryStatus, default: HnStoryStatus.DRAFT })
  status: HnStoryStatus;

  @BlLuxonDateTimeColumn({ nullable: true })
  publishedAt: DateTime;

  @OneToMany(() => HnStoryCoAuthor, (storyAuthor) => storyAuthor.story, { nullable: true })
  storyAuthors: HnStoryCoAuthor[];

  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  createdAt: DateTime;

  @BlLuxonDateTimeColumn({ nullable: true })
  lastModifiedAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  createdBy: HnUser;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  comments: number;

  @Column({ name: 'title_path', nullable: true })
  titlePath: string;

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
  get cleanTitlePath(): string {
    return this.titlePath ?? ClStringHelper.getCleanUrlPath(this.title);
  }

  public getContentRichText(): TeRichText {
    return new TeRichText(this.content);
  }

  public getContentEditionRichText(): TeRichText {
    return new TeRichText(this.contentEdition);
  }

  public getContentEditionRichTextAggregate(): TeRichTextAggregate {
    const richText = this.getContentRichText();
    const modifications = TeRichTextModifications.fromJsonObjectString(this.modifications);

    return new TeRichTextAggregate(richText, modifications);
  }

  public setContentEditionRichTextAggregate(richText: TeRichTextAggregate): void {
    this.contentEdition = richText.richText.toJson();
    this.modifications = richText.getModificationsAsString();
  }
}
