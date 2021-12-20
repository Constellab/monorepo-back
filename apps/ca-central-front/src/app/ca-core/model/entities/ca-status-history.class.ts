import {CaBaseEntity} from './ca-base-entity.class';
import {DateTime} from 'luxon';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {FlStatus} from '@monorepo/front-core-lib';

export abstract class CaStatusHistory<S extends string> extends CaBaseEntity {

  @ClLuxonTransform()
  endDate: DateTime;

  // status of this history
  status: FlStatus<S>;
}
