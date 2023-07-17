import {BlLuxonDateTimeColumn, BlUserCategory} from '@monorepo/back-core-lib';
import {BeforeInsert, Column, Entity, OneToMany, PrimaryColumn} from 'typeorm';
import {DateTime} from 'luxon';
import {ClDateHelper, clDefaultLang, clDefaultTheme, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {HnStoryAuthor} from '../story-author/hn-story-author.entity';
import {HnBrickUser} from '../brick-aggregate/brick-user/hn-brick-user.entity';

@Entity('User')
export class HnUser {

  @PrimaryColumn('uuid')
  id: string;

  @Column({nullable: false, length: 50})
  firstname: string;

  @Column({nullable: false, length: 50})
  lastname: string;

  @Column({unique: true, nullable: false, update: false})
  email: string;

  @Column({nullable: true})
  photo: string;

  @Column({nullable: false, type: 'enum', enum: BlUserCategory})
  category: BlUserCategory;

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Column({nullable: false, type: 'enum', enum: ClSupportedLanguage, default: clDefaultLang})
  lang: ClSupportedLanguage;

  @Column({nullable: false, type: 'enum', enum: ClTheme, default: clDefaultTheme})
  theme: ClTheme;

  @OneToMany(() => HnStoryAuthor, storyAuthor => storyAuthor.user, {nullable: true})
  storyAuthors: HnStoryAuthor[];

  @OneToMany(() => HnBrickUser, brickUser => brickUser.user, {nullable: true})
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
    this.firstname = userDto.firstname;
    this.lastname = userDto.lastname;
    this.photo = userDto.photo;
    this.email = userDto.email;
    this.category = userDto.category;
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
