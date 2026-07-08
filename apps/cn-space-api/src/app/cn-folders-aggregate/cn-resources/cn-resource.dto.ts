import { ClLuxonDateTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';

import { CnTypeStyle } from '../../cn-core/model/config/cn-type-style.class';
import { CnResource } from './cn-resource.entity';

export class CnShareResourceRequestDTO {
  resource_id!: string;
  name!: string;
  typing_name!: string;
  style!: CnTypeStyle;
  token!: string;
  is_application?: boolean;
}

export class CnResourceAccessDTO {
  id: string;
  // Url to open the resource/app embedded in place (resource-open page / iframe).
  embeddedUrl: string;
  // Url to open the resource/app standalone (e.g. in a new tab through the
  // launcher gateway).
  standaloneUrl: string;
  resourceId: string;
  name: string;
  typingName: string;
  style: CnTypeStyle;
  isApplication: boolean;

  @ClLuxonDateTransform()
  validUntil: DateTime;

  constructor(resource: CnResource, embeddedUrl: string, standaloneUrl: string, validUntil: DateTime) {
    this.id = resource.id;
    this.embeddedUrl = embeddedUrl;
    this.standaloneUrl = standaloneUrl;
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
