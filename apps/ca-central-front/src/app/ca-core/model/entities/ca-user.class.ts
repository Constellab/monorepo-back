import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {CaEntity} from './ca-entity.entity';
import {CmUserCategory, CmUserStatus} from '@monorepo/common-model';
import {FlDatasourcePaginated, FlUser} from '@monorepo/front-core-lib';

export interface CaNewUser {
  firstname: string;
  lastname: string;
  email: string;
  category: CmUserCategory;
  password: string;
  repeatPassword: string;
}

export class CaUser extends CaEntity implements FlUser {
  firstname: string;

  lastname: string;

  email: string;

  category: CmUserCategory;


  activity?: string;

  lang: ClSupportedLanguage;

  theme: ClTheme;

  photo: string;

  biography?: string;

  company?: string;

  status: CmUserStatus;

  phone?: string;

  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  @ClLuxonDateTimeTransform()
  lastLoginSuccess?: DateTime;

  get fullname(): string {
    return (this.firstname || '') + ' ' + (this.lastname || '');
  }

  public toString(): string {
    return this.fullname;
  }

  public isAdmin(): boolean {
    return this.category === CmUserCategory.ADMIN;
  }

  // return true if the user is one of the listed category
  public isCategory(...categories: CmUserCategory[]): boolean {
    if (categories == null || categories.length === 0) {
      return true;
    }
    return categories.includes(this.category);
  }

  public statusMailNotValidated(): boolean {
    return this.status === CmUserStatus.WAITING_FOR_EMAIL;
  }
}

export type CaUserDatasourcePaginated = FlDatasourcePaginated<CaUser>
