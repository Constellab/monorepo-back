import { BlLuxonDateTimeColumn, BlUserCategory } from '@monorepo/back-core-lib';
import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn, Unique } from 'typeorm';
import { DateTime } from 'luxon';
import { ClDateHelper, clDefaultLang, clDefaultTheme, ClSupportedLanguage, ClTheme } from '@monorepo/core-lib';
import { HnStoryCoAuthor } from '../story-author/hn-story-author.entity';
import { HnBrickUser } from '../brick-aggregate/brick-user/hn-brick-user.entity';
import { HnLiveTaskCoAuthor } from '../live-task-aggregate/live-task-co-author/hn-live-task-co-author.entity';

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

  @OneToMany(() => HnStoryCoAuthor, storyAuthor => storyAuthor.user, { nullable: true })
  storyAuthors: HnStoryCoAuthor[];

  @OneToMany(() => HnLiveTaskCoAuthor, liveTaskCoAuthor => liveTaskCoAuthor.user, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  liveTaskCoAuthors: HnLiveTaskCoAuthor[];

  @OneToMany(() => HnBrickUser, brickUser => brickUser.user, { nullable: true })
  brickUsers: HnBrickUser[];

  @BeforeInsert()
  initValues(): void {
    this.createdAt = ClDateHelper.getDate();
  }

  isAdmin(): boolean {
    return this.category === BlUserCategory.ADMIN;
  }

  setData(userDto: HnUserConstellabDTO): void {
    this.id = userDto.id;
    this.userCode = userDto.firstname[0].toUpperCase() + userDto.lastname[0].toUpperCase() + '-' + userDto.id.substring(0, 8);
    this.alias = userDto.firstname[0].toUpperCase() + userDto.firstname.substring(1, userDto.firstname.length - 1)
      + ' ' + userDto.lastname[0].toUpperCase();
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


export class HnUserConstellabDTO {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  category: BlUserCategory;
  activity?: string;
  company?: string;
  biography?: string;
  theme: ClTheme;
  photo: string;
  lang: ClSupportedLanguage;
}
