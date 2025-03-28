import { ClLuxonDateTimeTransform, ClLuxonDateTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { CnTypeStyle } from '../../cn-core/model/config/cn-type-style.class';
import { CnResource } from './cn-resource.entity';

export class CnShareResourceRequestDTO {
  resource_id: string;
  name: string;
  typing_name: string;
  style: CnTypeStyle;
  token: string;

  @ClLuxonDateTimeTransform()
  valid_until?: DateTime;
}

export class CnResourceAccessDTO {
  accessUrl: string;
  resourceId: string;
  name: string;
  typingName: string;
  style: CnTypeStyle;

  @ClLuxonDateTransform()
  validUntil: DateTime;

  constructor(resource: CnResource, accessUrl: string, validUntil: DateTime) {
    this.accessUrl = accessUrl;
    this.resourceId = resource.resourceId;
    this.name = resource.name;
    this.typingName = resource.typingName;
    this.style = resource.style;
    this.validUntil = validUntil;
  }
}
