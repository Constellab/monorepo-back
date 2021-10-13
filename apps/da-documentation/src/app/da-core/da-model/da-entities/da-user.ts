import {DaEntity} from './da-entity.class';
import {DateTime} from 'luxon';
import {ClSupportedLanguage} from '@monorepo/core-lib';

export class DaUser extends DaEntity{
  firstname: string;

  lastname: string;

  email: string;

  createdAt: DateTime;

  lang: ClSupportedLanguage;
}
