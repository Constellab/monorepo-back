import {JsonObject, JsonProperty} from 'json2typescript';
import {SupportedLanguage} from '../global/supported-language.class';
import {DateTime} from 'luxon';
import {ClLuxonConverter} from '@monorepo/core-lib';
import {FlEntity} from '@monorepo/front-core-lib';

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
  phone: string;
  category: UserCategory;
  password: string;
  repeatPassword: string;
}

@JsonObject('User')
export class User extends FlEntity {
  @JsonProperty('firstname', String)
  firstname: string = null;

  @JsonProperty('lastname', String)
  lastname: string = null;

  @JsonProperty('email', String)
  email: string = null;

  @JsonProperty('category', String)
  category: UserCategory = null;

  @JsonProperty('phone', String)
  phone: string = null;

  @JsonProperty('job', String)
  job: string = null;

  @JsonProperty('lang', String)
  lang: SupportedLanguage = null;

  @JsonProperty('photo', String, true)
  photo: string = null;

  @JsonProperty('createdAt', ClLuxonConverter)
  createdAt: DateTime = null;

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
