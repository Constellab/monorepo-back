import { ClLuxonDateTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';

import { CnTypeStyle } from '../../cn-core/model/config/cn-type-style.class';
import { CnResource } from './cn-resource.entity';

export class CnShareResourceRequestDTO {
  resource_id: string;
  name: string;
  typing_name: string;
  style: CnTypeStyle;
  token: string;
  is_application?: boolean;
}

export class CnResourceAccessDTO {
  id: string;
  accessUrl: string;
  resourceId: string;
  name: string;
  typingName: string;
  style: CnTypeStyle;
  isApplication: boolean;

  @ClLuxonDateTransform()
  validUntil: DateTime;

  constructor(resource: CnResource, accessUrl: string, validUntil: DateTime) {
    this.id = resource.id;
    this.accessUrl = accessUrl;
    this.resourceId = resource.resourceId;
    this.name = resource.name;
    this.typingName = resource.typingName;
    this.style = resource.style;
    this.validUntil = validUntil;
    this.isApplication = resource.isApplication;
  }
}

export interface CnSaveResourceResultDTO {
  mode: 'create' | 'update';
  resource: CnResource;
}
