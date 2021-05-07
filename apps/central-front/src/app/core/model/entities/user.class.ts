import {DateTime} from 'luxon';
import {ClLuxonTransform, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {Entity} from './entity.entity';

export enum UserCategory {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  PUBLIC_RESEARCH = 'PUBLIC_RESEARCH',
  PRIVATE_INDUSTRY = 'PRIVATE_INDUSTRY',
}

export interface NewUser {
  firstname: string;
  lastname: string;
  email: string;
  category: UserCategory;
  password: string;
  repeatPassword: string;
}

export class User extends Entity {
  firstname: string;

  lastname: string;

  email: string;

  category: UserCategory;

  phone: string;

  job: string;

  lang: ClSupportedLanguage;

  theme: ClTheme;

  photo: string;

  @ClLuxonTransform()
  createdAt: DateTime;

  get fullname(): string {
    return (this.firstname || '') + ' ' + (this.lastname || '');
  }

  public toString(): string {
    return this.fullname;
  }

  /**
   * return the user profile picture if exist or a default image
   */
  public getPhotoWithDefault(): string {
    return this.photo || 'assets/images/portrait.png';
  }

  public isAdmin(): boolean {
    return this.category === UserCategory.ADMIN;
  }

  // return true if the user is one of the listed category
  public isCategory(...categories: UserCategory[]): boolean {
    if (categories == null || categories.length === 0) {
      return true;
    }
    return categories.includes(this.category);
  }
}
