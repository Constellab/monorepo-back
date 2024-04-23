import {BeforeInsert, Column, Entity, ManyToMany, OneToOne} from 'typeorm';
import {Exclude} from 'class-transformer';
import type {CnGroupSingleUser, CnGroupTeam} from '../cn-groups/cn-group.entity';
import * as argon2 from 'argon2';
import {ClDateHelper, clDefaultLang, clDefaultTheme, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {BlEntityWithId, BlLuxonDateTimeColumn, BlUser, BlUserCategory, BlUserStatus} from '@monorepo/back-core-lib';
import {CnSpaceUser} from '../cn-spaces/cn-space-user.entity';


@Entity('user')
export class CnUser extends BlEntityWithId implements BlUser {

  @Column({nullable: false, length: 50})
  firstname: string;

  @Column({nullable: false, length: 50})
  lastname: string;

  @Column({unique: true, nullable: false, update: false})
  email: string;

  @Exclude({toPlainOnly: true})
  @Column({nullable: false})
  password: string;

  @Column({nullable: false, type: 'enum', enum: BlUserCategory})
  category: BlUserCategory;

  @Column({nullable: true})
  activity: string;

  @Column({nullable: true})
  biography: string;

  @Exclude()
  @Column({nullable: false, default: 0})
  failedLoginCount: number;

  @Exclude()
  @BlLuxonDateTimeColumn({nullable: true})
  lastLoginAttempt: DateTime;

  @BlLuxonDateTimeColumn({nullable: true})
  lastLoginSuccess: DateTime;

  @Column({nullable: false, type: 'enum', enum: ClSupportedLanguage, default: clDefaultLang})
  lang: ClSupportedLanguage;

  @Column({nullable: false, type: 'enum', enum: ClTheme, default: clDefaultTheme})
  theme: ClTheme;

  // use the string name and import type to avoid circular dependency
  @ManyToMany('CnGroupTeam', (group: CnGroupTeam) => group.users)
  groups: CnGroupTeam[];

  @Exclude()
  @OneToOne('CnGroupSingleUser',
    (group: CnGroupSingleUser) => group.user)
  ownGroup: CnGroupSingleUser;

  @Column({nullable: false, type: 'enum', enum: BlUserStatus, default: BlUserStatus.WAITING_FOR_EMAIL})
  status: BlUserStatus;

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Column({nullable: true})
  photo: string;

  @Column({nullable: true})
  company: string;

  @Exclude()
  @Column({default: false})
  has2FA: boolean;

  @Column({nullable: true, length: 50})
  phone: string;

  //////////////////// TRANSIENT METHODS //////////////////

  @BeforeInsert()
  initValues(): void {
    this.failedLoginCount = 0;
    this.lastLoginAttempt = null;
    this.createdAt = ClDateHelper.getDate();

    // force the lang to en
    this.lang = clDefaultLang;
    this.theme = clDefaultTheme;
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return argon2.verify(this.password, attempt);
  }

  get fullname(): string {
    return this.firstname + ' ' + this.lastname;
  }

  getUserInfo(): string {
    return `id : ${this.id} - mail : ${this.email}`;
  }

  isAdmin(): boolean {
    return this.category === BlUserCategory.ADMIN;
  }
}

export class CnUserEditDTO {
  firstname: string;
  lastname: string;
  activity: string;
  company: string;
  biography: string;
  phone: string;
}

export interface CnUserTransportDto {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  theme: ClTheme;
  category: BlUserCategory;

  lang: ClSupportedLanguage;
  activity: string;
  company: string;
  biography: string;

  spaceUsers?: CnSpaceUser[];
}
