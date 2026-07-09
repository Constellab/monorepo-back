import { BlLuxonDateTimeColumn, BlUserCategory } from '@monorepo/back-core-lib';
import {
  CL_DEFAULT_LANG,
  CL_DEFAULT_THEME,
  ClDateHelper,
  ClSupportedLanguage,
  ClTheme,
} from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { BeforeInsert, Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Unique(['userCode'])
@Entity('user')
export class HnUser {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ nullable: false, length: 11, update: false })
  userCode!: string;

  @Column({ nullable: false, length: 52 })
  alias!: string;

  @Column({ nullable: false, length: 50 })
  firstname!: string;

  @Column({ nullable: false, length: 50 })
  lastname!: string;

  @Column({ unique: true, nullable: false, update: false })
  email!: string;

  @Column({ nullable: true })
  photo!: string | null;

  @Column({ nullable: true })
  githubLink!: string | null;

  @Column({ nullable: true })
  linkedinLink!: string | null;

  @Column({ nullable: true })
  xLink!: string | null;

  @Column({ nullable: true })
  interests!: string | null;

  @Column({ nullable: false, type: 'enum', enum: BlUserCategory })
  category!: BlUserCategory;

  @BlLuxonDateTimeColumn({ nullable: false, update: false })
  createdAt!: DateTime;

  @Column({ nullable: false, type: 'enum', enum: ClSupportedLanguage, default: CL_DEFAULT_LANG })
  lang!: ClSupportedLanguage;

  @Column({ nullable: false, type: 'enum', enum: ClTheme, default: CL_DEFAULT_THEME })
  theme!: ClTheme;

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
  photo: string | null;
  lang: ClSupportedLanguage;
}

export interface HnUserSearchFilters {
  alias?: string;
  email?: string;
}
