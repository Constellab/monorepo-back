import {BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {BeforeInsert, Column, Entity, ManyToMany, OneToMany, PrimaryColumn} from 'typeorm';
import {DateTime} from 'luxon';
import {ClDateHelper, clDefaultLang, ClSupportedLanguage} from '@monorepo/core-lib';
import {CmUserCategory} from '@monorepo/common-model';
import {HnStory} from '../story/hn-story.entity';
import {HnStoryAuthor} from '../story-author/hn-story-author.entity';

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

  @Column({nullable: false, type: 'enum', enum: CmUserCategory})
  category: CmUserCategory;

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Column({nullable: false, type: 'enum', enum: ClSupportedLanguage, default: clDefaultLang})
  lang: ClSupportedLanguage;

  @OneToMany(() => HnStoryAuthor, storyAuthor => storyAuthor.user, {nullable: true})
  storyAuthors: HnStoryAuthor[];

  @BeforeInsert()
  initValues(): void {
    this.createdAt = ClDateHelper.getDate();
  }

  isAdmin(): boolean {
    return this.category === CmUserCategory.ADMIN;
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
  category: CmUserCategory;
  activity?: string;
  company?: string;
  biography?: string;
  photo: string;
  lang: ClSupportedLanguage;
}
