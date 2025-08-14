import { BlLuxonDateTimeColumn, BlUserCategory } from '@monorepo/back-core-lib';
import {
  ClDateHelper,
  clDefaultLang,
  clDefaultTheme,
  ClSupportedLanguage,
  ClTheme,
} from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn, Unique } from 'typeorm';

import { HnAgentCoAuthor } from '../agent-aggregate/agent-co-author/hn-agent-co-author.entity';
import { HnBrickUser } from '../brick-aggregate/brick-user/hn-brick-user.entity';
import { HnStoryCoAuthor } from '../story-author/hn-story-author.entity';
import { HnTagCoAuthor } from '../tag-aggregate/tag-co-author/hn-tag-co-author.entity';
import { HnCommunityAppCoAuthor } from '../community-app-aggregate/community-app-co-author/hn-community-app-co-author.entity';

@Unique(['userCode'])
@Entity('user')
export class HnUser {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_code', nullable: false, length: 11, update: false })
  userCode: string;

  @Column({ nullable: false, length: 52 })
  alias: string;

  @Column({ nullable: false, length: 50 })
  firstname: string;

  @Column({ nullable: false, length: 50 })
  lastname: string;

  @Column({ unique: true, nullable: false, update: false })
  email: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ name: 'github_link', nullable: true })
  githubLink: string;

  @Column({ name: 'linkedin_link', nullable: true })
  linkedinLink: string;

  @Column({ name: 'x_link', nullable: true })
  xLink: string;

  @Column({ nullable: true })
  interests: string;

  @Column({ nullable: false, type: 'enum', enum: BlUserCategory })
  category: BlUserCategory;

  @BlLuxonDateTimeColumn({ nullable: false, update: false })
  createdAt: DateTime;

  @Column({ nullable: false, type: 'enum', enum: ClSupportedLanguage, default: clDefaultLang })
  lang: ClSupportedLanguage;

  @Column({ nullable: false, type: 'enum', enum: ClTheme, default: clDefaultTheme })
  theme: ClTheme;

  @OneToMany(() => HnStoryCoAuthor, (storyAuthor) => storyAuthor.user, { nullable: true })
  storyAuthors: HnStoryCoAuthor[];

  @OneToMany(() => HnAgentCoAuthor, (agentCoAuthor) => agentCoAuthor.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  agentCoAuthors: HnAgentCoAuthor[];

  @OneToMany(() => HnCommunityAppCoAuthor, (communityAppCoAuthor) => communityAppCoAuthor.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  communityAppCoAuthors: HnCommunityAppCoAuthor[];

  @OneToMany(() => HnBrickUser, (brickUser) => brickUser.user, { nullable: true })
  brickUsers: HnBrickUser[];

  @OneToMany(() => HnTagCoAuthor, (tagCoAuthor) => tagCoAuthor.user, { nullable: true })
  tagCoAuthors: HnTagCoAuthor[];

  @BeforeInsert()
  initValues(): void {
    this.createdAt = ClDateHelper.getDate();
  }

  isAdmin(): boolean {
    return this.category === BlUserCategory.ADMIN;
  }

  setData(userDto: HnUserConstellabDTO): void {
    this.id = userDto.id;
    this.userCode =
      userDto.firstname[0].toUpperCase() +
      userDto.lastname[0].toUpperCase() +
      '-' +
      userDto.id.substring(0, 8);
    this.alias =
      userDto.firstname[0].toUpperCase() +
      userDto.firstname.substring(1, userDto.firstname.length - 1) +
      ' ' +
      userDto.lastname[0].toUpperCase();
    this.firstname = userDto.firstname;
    this.lastname = userDto.lastname;
    this.photo = userDto.photo;
    this.email = userDto.email;
    this.category = userDto.category;
  }

  getUserInfo(): string {
    return `id : ${this.id} - mail : ${this.email}`;
  }
}

export interface HnUserConstellabDTO {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  category: BlUserCategory;
  theme: ClTheme;
  photo: string;
  lang: ClSupportedLanguage;
}

export interface HnUserSearchFilters {
  alias?: string;
  email?: string;
}
