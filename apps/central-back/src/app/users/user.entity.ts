import {BeforeInsert, Column, Entity, ManyToMany, OneToOne} from 'typeorm';
import {EntityWithId} from '../core/model/entities/entity-with-id.entity';
import {Exclude} from 'class-transformer';
import {UserCategory} from './user-category.enum';
import {GroupSingleUser, GroupUsers} from '../groups/group.entity';
import * as argon2 from 'argon2';
import {ClDateHelper, clDefaultLang, clDefaultTheme, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {LuxonDateTimeColumn} from '../core/decorators/luxon-column.decorator';
import {DateTime} from 'luxon';


@Entity()
export class User extends EntityWithId {

  @Column({nullable: false, length: 50})
  firstname: string;

  @Column({nullable: false, length: 50})
  lastname: string;

  @Column({unique: true, nullable: false, update: false})
  email: string;

  @Exclude({toPlainOnly: true})
  @Column({nullable: false})
  password: string;

  @Column({nullable: false, type: 'enum', enum: UserCategory})
  category: UserCategory;

  @Column({nullable: false})
  phone: string;

  @Column({nullable: true})
  job: string;

  @Exclude()
  @Column({nullable: false, default: 0})
  failedLoginCount: number;

  @Exclude()
  @LuxonDateTimeColumn({nullable: true})
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

  @Exclude()
  @Column({type: 'bool', default: false})
  activated: boolean;

  @Exclude()
  @Column({type: 'bool', default: false})
  adminActivated: boolean;

  @LuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  //////////////////// TRANSIENT METHODS //////////////////

  @BeforeInsert()
  async initValues(): Promise<void> {
    this.failedLoginCount = 0;
    this.lastLoginAttempt = null;
    this.activated = false;
    this.adminActivated = false;
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
    return this.category === UserCategory.ADMIN;
  }

}
