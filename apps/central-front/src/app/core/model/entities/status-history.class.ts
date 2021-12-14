import {BaseEntity} from './base-entity.class';
import {DateTime} from 'luxon';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {FlStatus} from '@monorepo/front-core-lib';

export abstract class StatusHistory<S extends string> extends BaseEntity {

  @ClLuxonTransform()
  endDate: DateTime;

  // status of this history
  status: FlStatus<S>;
}
