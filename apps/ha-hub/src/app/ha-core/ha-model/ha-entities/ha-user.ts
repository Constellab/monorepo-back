import {HaEntity} from './ha-entity.class';
import {DateTime} from 'luxon';
import {ClSupportedLanguage} from '@monorepo/core-lib';

export class HaUser extends HaEntity{
  firstname: string;

  lastname: string;

  email: string;

  createdAt: DateTime;

  lang: ClSupportedLanguage;
}
