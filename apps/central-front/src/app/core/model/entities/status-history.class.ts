import {BaseEntity} from './base-entity.class';
import {DateTime} from 'luxon';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {FlStatus} from '@monorepo/front-core-lib';

export abstract class StatusHistory<S extends string> extends BaseEntity
  implements FlStatus {

  @ClLuxonTransform()
  endDate: DateTime;

  // status of this history
  status: S;

  abstract getStatusClassColor(mode: 'background' | 'text'): string;

  abstract getStatusIcon(): string;

  getStatusName(): string {
    return this.status;
  }
}
