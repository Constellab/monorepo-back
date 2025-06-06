import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { TeRichTextDTO } from '@monorepo/te-text-editor';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { HnTagCoAuthor } from '../tag-co-author/hn-tag-co-author.entity';
import { HnTagValue } from '../tag-value/hn-tag-value.entity';
import { Type } from 'class-transformer';
import { HnUser } from '../../users/hn-user.entity';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { ClDateHelper } from '@monorepo/core-lib';

export enum HnTagKeyType {
  STRING = 'STRING',
  INT = 'INTEGER',
  FLOAT = 'FLOAT',
  BOOLEAN = 'BOOLEAN',
  DATETIME = 'DATETIME',
}

@Entity('tag_key')
export class HnTagKey extends BlEntityWithId {
  @Column({ unique: true })
  technicalName: string;

  @Column()
  label: string;

  @Column({ type: 'enum', enum: HnTagKeyType, nullable: false })
  type: HnTagKeyType;

  @Column({ default: false })
  deprecated: boolean;

  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  createdAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  createdBy?: HnUser;

  @BlLuxonDateTimeColumn({ nullable: true })
  lastModifiedAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  lastModifiedBy: HnUser;

  @BlLuxonDateTimeColumn({ nullable: true })
  publishedAt?: DateTime;

  @Column({ nullable: true })
  unit?: string;

  @Column({ name: 'description', type: 'simple-json', nullable: true })
  description?: TeRichTextDTO;

  @Column({ nullable: true, type: 'simple-json' })
  additionalInfosSpecs?: HnTagAdditionalInfoSpecs;

  @ManyToOne(() => HnSpace, { eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  space?: HnSpace;

  @OneToMany(() => HnTagCoAuthor, (tagCoAuthor) => tagCoAuthor.tagKey, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  tagCoAuthors: HnTagCoAuthor[];

  @OneToMany(() => HnTagValue, (tagValue) => tagValue.tagKey, { nullable: true, onDelete: 'CASCADE' })
  tagValues: HnTagValue[];

  @BeforeInsert()
  setCreatedByUser(): void {
    if (this.createdBy == null) {
      this.createdBy = HnCurrentUserHelper.getCurrentUser();
      this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser();
    }
    this.createdAt = ClDateHelper.getDate();
    this.lastModifiedAt = ClDateHelper.getDate();
  }

  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }
}

export type HnTagKeyAdditionalInfosSpecs = Record<string, any>;

export interface HnTagKeyEditAdditionalInfoSpec {
  name: string;
}

export interface HnTagParamSpec {
  type: string;
  optional: boolean;
  default_value?: any;
  unit?: string;
  human_name?: string;
  short_description?: string;
  visibility: 'protected' | 'public' | 'private';
}

export type HnTagAdditionalInfoSpecs = Record<string, HnTagParamSpec>;
