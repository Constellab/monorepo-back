import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {CaEntity} from './ca-entity.entity';
import {CmUserCategory} from '@monorepo/common-model';
import {FlDatasourcePaginated, FlUser} from '@monorepo/front-core-lib';

export interface CaNewUser {
  firstname: string;
  lastname: string;
  email: string;
  category: CmUserCategory;
  password: string;
  repeatPassword: string;
}

export class CaEditUserDTO {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  photo?: string;
}

export class CaUser extends CaEntity implements FlUser {
  firstname: string;

  lastname: string;

  email: string;

  category: CmUserCategory;

  phone: string;

  activity?: string;

  lang: ClSupportedLanguage;

  theme: ClTheme;

  photo: string;

  biography?: string;

  company?: string;


  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

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
}

export type CaUserDatasourcePaginated = FlDatasourcePaginated<CaUser>
