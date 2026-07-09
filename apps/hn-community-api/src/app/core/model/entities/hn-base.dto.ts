import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';

import { HnUserDto } from '../../../users/hn-user.dto';
import { HnBaseEntity } from './hn-base.entity';

export abstract class HnBaseDto extends BlEntityWithIdDTO {
  createdAt: string | null;
  createdBy?: HnUserDto;
  lastModifiedAt: string | null;
  lastModifiedBy?: HnUserDto;

  protected constructor(baseEntity: HnBaseEntity) {
    super();
    this.id = baseEntity.id;
    this.createdAt = baseEntity.createdAt.toISO();
    this.createdBy = baseEntity.createdBy ? new HnUserDto(baseEntity.createdBy) : undefined;
    this.lastModifiedAt = baseEntity.lastModifiedAt.toISO();
    this.lastModifiedBy = baseEntity.lastModifiedBy ? new HnUserDto(baseEntity.lastModifiedBy) : undefined;
  }
}
