import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {BeforeInsert, Column, Entity} from 'typeorm';
import {DateTime} from 'luxon';
import {ClDateHelper, clDefaultLang, ClSupportedLanguage} from '@monorepo/core-lib';
import {CmUserCategory} from '@monorepo/common-model';

@Entity('User')
export class HnUser extends BlEntityWithId{

  @Column({nullable: false, length: 50})
  firstname: string;

  @Column({nullable: false, length: 50})
  lastname: string;

  @Column({unique: true, nullable: false, update: false})
  email: string;

  @Column({nullable: false, type: 'enum', enum: CmUserCategory})
  category: CmUserCategory;

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Column({nullable: false, type: 'enum', enum: ClSupportedLanguage, default: clDefaultLang})
  lang: ClSupportedLanguage;

  @BeforeInsert()
  initValues(): void{
    this.createdAt = ClDateHelper.getDate();
  }
}
