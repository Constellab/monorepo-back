import {BaseEntity} from './base-entity.class';
import {JsonObject, JsonProperty} from 'json2typescript';
import {DateTime} from 'luxon';
import {ClLuxonConverter} from '@monorepo/core-lib';
import {FlStatus} from '@monorepo/front-core-lib';

@JsonObject('StatusHistory')
export abstract class StatusHistory<S extends string> extends BaseEntity
  implements FlStatus {

  @JsonProperty('endDate', ClLuxonConverter, true)
  endDate: DateTime = null;

  // status of this history
  @JsonProperty('status', String)
  status: S = null;

  abstract getStatusClassColor(mode: 'background' | 'text'): string;

  abstract getStatusIcon(): string;

  getStatusName(): string {
    return this.status;
  }
}
