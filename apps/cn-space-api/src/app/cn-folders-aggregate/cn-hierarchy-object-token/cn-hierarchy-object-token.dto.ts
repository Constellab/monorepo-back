import { DateTime } from 'luxon';
import { ClLuxonDateTransform } from '@monorepo/core-lib';
import { BlBaseEntityDto } from '@monorepo/back-core-lib';
import { CnHierarchyObjectToken } from './cn-hierarchy-object-token.entity';

export class CnHierarchyObjectTokenSaveDTO {
  @ClLuxonDateTransform()
  expirationDate: DateTime;
}

export class CnHierarchyObjectTokenDTO extends BlBaseEntityDto {
  @ClLuxonDateTransform()
  expirationDate: DateTime;

  url: string;

  constructor(entity: CnHierarchyObjectToken, linkUrl: string) {
    super(entity);
    this.expirationDate = entity.expirationDate;
    this.url = linkUrl;
  }
}
