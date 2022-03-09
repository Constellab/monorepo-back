import {HaEntity} from './ha-entity.class';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform, ClLuxonTransform, ClSupportedLanguage} from '@monorepo/core-lib';
import {FlEntity} from '@monorepo/front-core-lib';

export class HaUser implements FlEntity {
  id: string;

  firstname: string;

  lastname: string;

  email: string;

  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  lang: ClSupportedLanguage;

  category: HaUserCategory;

  get fullname(): string {
    return (this.firstname || '') + ' ' + (this.lastname || '');
  }
}

export enum HaUserCategory {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  PUBLIC_RESEARCH = 'PUBLIC_RESEARCH',
  PRIVATE_INDUSTRY = 'PRIVATE_INDUSTRY',
}
