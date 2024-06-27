import {HnUserDto} from '../../../users/hn-user.dto';
import {BlEntityWithIdDTO} from '@monorepo/back-core-lib';
import {HnBaseEntity} from './hn-base.entity';

export abstract class HnBaseDto extends BlEntityWithIdDTO {
  createdAt: string;
  createdBy: HnUserDto;
  lastModifiedAt: string;
  lastModifiedBy: HnUserDto;

  protected constructor(baseEntity: HnBaseEntity) {
    super();
    this.id = baseEntity.id;
    this.createdAt = baseEntity.createdAt.toISO();
    this.createdBy = new HnUserDto(baseEntity.createdBy);
    this.lastModifiedAt = baseEntity.lastModifiedAt.toISO();
    this.lastModifiedBy = new HnUserDto(baseEntity.lastModifiedBy);
  }
}
