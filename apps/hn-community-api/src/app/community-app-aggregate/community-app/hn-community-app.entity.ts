import { TeRichTextDTO } from '@monorepo/te-text-editor';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

import { HnBaseEntity } from '../../core/model/entities/hn-base.entity';
import { HnFileApp } from '../../file-aggregate/file-app/hn-file-app.entity';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { HnCommunityAppCoAuthor } from '../community-app-co-author/hn-community-app-co-author.entity';
import { HnCommunityAppUser } from '../community-app-user/hn-community-app-user.entity';

@Entity('app')
export class HnCommunityAppEntity extends HnBaseEntity {
  @Column({ nullable: false })
  title!: string;

  @Column({ type: 'simple-json', nullable: true })
  description?: TeRichTextDTO;

  @Column({ nullable: true })
  picture?: string;

  @Column({ nullable: true })
  @Index({ unique: true })
  appUrl?: string;

  @Column({ nullable: true })
  contactMail?: string;

  @Column({ default: 0 })
  likes!: number;

  @Column({ default: 0 })
  comments!: number;

  @Column({ default: 0 })
  executions!: number;

  @ManyToOne(() => HnSpace, { eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: true })
  space?: HnSpace;

  @OneToMany(() => HnFileApp, (appFile) => appFile.entity, { nullable: true })
  appFiles!: HnFileApp[];

  @OneToMany(() => HnCommunityAppUser, (appUser) => appUser.app, { nullable: true, eager: true })
  appUsers!: HnCommunityAppUser[];

  @OneToMany(() => HnCommunityAppCoAuthor, (communityAppCoAuthor) => communityAppCoAuthor.communityApp, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  communityAppCoAuthors!: HnCommunityAppCoAuthor[];

  @Column({ nullable: true })
  video?: string;

  @Column('simple-array', { nullable: true })
  figures?: string[];
}

export type HnCommunityApp = Omit<HnCommunityAppEntity, 'appFiles' | 'appUsers'>;
