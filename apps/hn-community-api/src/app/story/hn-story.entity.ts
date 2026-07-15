import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { ClDateHelper, ClStringHelper } from '@monorepo/core-lib';
import {
  TeRichText,
  TeRichTextAggregate,
  TeRichTextDTO,
  TeRichTextModifications,
} from '@monorepo/te-text-editor';
import { Expose, Type } from 'class-transformer';
import { DateTime } from 'luxon';
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

import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnStoryCoAuthor } from '../story-author/hn-story-author.entity';
import { HnTopic } from '../topic/hn-topic.entity';
import { HnUser } from '../users/hn-user.entity';

export enum HnStoryStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

@Entity('story')
export class HnStory extends BlEntityWithId {
  @Column()
  title!: string;

  // the database was modified to use a long text instead of a json
  @Column({ type: 'simple-json' })
  content!: TeRichTextDTO;

  @Column({ type: 'simple-json', nullable: true })
  contentEdition!: TeRichTextDTO | null;

  @Column({ type: 'longtext', nullable: true })
  modifications!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  firstParagraph!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  mainPicture!: string | null;

  @ManyToMany(() => HnTopic, (topic) => topic.stories, { nullable: true })
  @JoinTable()
  topics!: HnTopic[] | null;

  @Column({ type: 'enum', enum: HnStoryStatus, default: HnStoryStatus.DRAFT })
  status!: HnStoryStatus;

  @BlLuxonDateTimeColumn({ nullable: true })
  publishedAt!: DateTime | null;

  @OneToMany(() => HnStoryCoAuthor, (storyAuthor) => storyAuthor.story, { nullable: true })
  storyAuthors!: HnStoryCoAuthor[];

  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  createdAt!: DateTime;

  @BlLuxonDateTimeColumn({ nullable: true })
  lastModifiedAt!: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  createdBy!: HnUser;

  @Column({ default: 0 })
  likes!: number;

  @Column({ default: 0 })
  comments!: number;

  @Column({ nullable: true, type: 'varchar' })
  titlePath!: string | null;

  @BeforeInsert()
  setCreatedDate(): void {
    this.createdBy = HnCurrentUserHelper.getAndCheckCurrentUser();
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
    const modifications = TeRichTextModifications.fromJsonObjectString(this.modifications ?? '');

    return new TeRichTextAggregate(richText, modifications);
  }

  public setContentEditionRichTextAggregate(richText: TeRichTextAggregate): void {
    this.contentEdition = richText.richText.toJson();
    this.modifications = richText.getModificationsAsString();
  }
}
