import {BaseEntity} from './base-entity.class';
import {JsonObject, JsonProperty} from 'json2typescript';
import {LuxonConverter} from '../../utils/json-converter';
import {DateTime} from 'luxon';

@JsonObject('StatusHistory')
export abstract class StatusHistory<S> extends BaseEntity {

  @JsonProperty('endDate', LuxonConverter, true)
  endDate: DateTime = null;

  // status of this history
  @JsonProperty('status', String)
  status: S = null;

  abstract getColor(mode: 'background' | 'text'): string;

  abstract getIcon(): string;
}

export type GetStatusColorClassFunction = (status: string,
                                           mode: 'background' | 'text') => string;

export type GetStatusIconFunction = (status: string) => string;
