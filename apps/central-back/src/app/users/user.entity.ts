import {BeforeInsert, Column, Entity, ManyToMany, OneToOne} from 'typeorm';
import {Exclude} from 'class-transformer';
import {GroupSingleUser, GroupUsers} from '../groups/group.entity';
import * as argon2 from 'argon2';
import {ClDateHelper, clDefaultLang, clDefaultTheme, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {CmUserCategory, CmUserStatus} from '@monorepo/common-model';
import {BlEntityWithId, BlLuxonDateTimeColumn, BlUser} from '@monorepo/back-core-lib';


@Entity()
export class User extends BlEntityWithId implements BlUser {

  @Column({nullable: false, length: 50})
  firstname: string;

  @Column({nullable: false, length: 50})
  lastname: string;

  @Column({unique: true, nullable: false, update: false})
  email: string;

  @Exclude({toPlainOnly: true})
  @Column({nullable: false})
  password: string;

  @Column({nullable: false, type: 'enum', enum: CmUserCategory})
  category: CmUserCategory;

  @Column({nullable: true})
  job: string;

  @Exclude()
  @Column({nullable: false, default: 0})
  failedLoginCount: number;

  @Exclude()
  @BlLuxonDateTimeColumn({nullable: true})
  lastLoginAttempt: DateTime;

  @Column({nullable: false, type: 'enum', enum: ClSupportedLanguage, default: clDefaultLang})
  lang: ClSupportedLanguage;

  @Column({nullable: false, type: 'enum', enum: ClTheme, default: clDefaultTheme})
  theme: ClTheme;

  @ManyToMany(() => GroupUsers, (group: GroupUsers) => group.users)
  groups: GroupUsers[];

  @Exclude()
  @OneToOne(() => GroupSingleUser, (group: GroupSingleUser) => group.user,
    {cascade: ['insert']})
  ownGroup: GroupSingleUser;

  @Column({nullable: false, type: 'enum', enum: CmUserStatus, default: CmUserStatus.WAITING_FOR_EMAIL})
  status: CmUserStatus;

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  //////////////////// TRANSIENT METHODS //////////////////

  @BeforeInsert()
  initValues(): void {
    this.failedLoginCount = 0;
    this.lastLoginAttempt = null;
    this.status = CmUserStatus.WAITING_FOR_EMAIL;
    this.createdAt = ClDateHelper.getDate();

    // force the lang to en
    this.lang = clDefaultLang;
    this.theme = clDefaultTheme;

    // init the date of own group because the cascade insert doesn't trigger the BeforeInsert
    this.ownGroup.createdAt = ClDateHelper.getDate();
    this.ownGroup.lastModifiedAt = ClDateHelper.getDate();
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
    return this.category === CmUserCategory.ADMIN;
  }

}
