import {BeforeInsert, Column, CreateDateColumn, Entity, ManyToMany, OneToOne} from 'typeorm';
import {EntityWithId} from '../core/model/entities/entity-with-id.entity';
import {Exclude} from 'class-transformer';
import {UserCategory} from './user-category.enum';
import {GroupSingleUser, GroupUsers} from '../groups/group.entity';
import * as argon2 from 'argon2';
import {DateTransform} from '../core/decorators/date-transform.decorator';
import {clDefaultLang, clDefaultTheme, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';


@Entity()
export class User extends EntityWithId {

  @Column({nullable: false, length: 50})
  firstname: string;

  @Column({nullable: false, length: 50})
  lastname: string = null;

  @Column({unique: true, nullable: false, update: false})
  email: string = null;

  @Exclude({toPlainOnly: true})
  @Column({nullable: false})
  password: string = null;

  @Column({nullable: false, type: 'enum', enum: UserCategory})
  category: UserCategory = null;

  @Column({nullable: false})
  phone: string = null;

  @Column({nullable: true})
  job: string = null;

  @Exclude()
  @Column({nullable: false, default: 0})
  failedLoginCount: number = null;

  @Exclude()
  @Column({nullable: true})
  lastLoginAttempt: Date = null;

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

  @DateTransform()
  @CreateDateColumn({nullable: false, update: false})
  createdAt: Date;

  //////////////////// TRANSIENT METHODS //////////////////

  @BeforeInsert()
  async initValues(): Promise<void> {
    this.failedLoginCount = 0;
    this.lastLoginAttempt = null;
    this.activated = false;
    this.adminActivated = false;
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
