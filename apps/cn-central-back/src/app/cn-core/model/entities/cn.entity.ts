import { ManyToOne, Relation } from 'typeorm';
import { CnUser, CnUserEntity } from '../../../cn-users/cn-user.entity';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';
import {
  BlEntityWithId,
  BlEntityWithIdDTO,
  BlLuxonDateTimeColumn,
  BlNotUpdatable,
} from '@monorepo/back-core-lib';
import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';

/**
 * Basic entity with same info as CnBaseEntity
 * but without the @BeforeInsert() and @BeforeUpdate() methods
 * The creation and modification info need to be set manually
 */
export abstract class CnEntity extends BlEntityWithId {
  @BlLuxonDateTimeColumn({ nullable: false, update: false })
  createdAt: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  @BlNotUpdatable()
  createdBy: Relation<CnUser>;

  @BlLuxonDateTimeColumn()
  lastModifiedAt: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true })
  lastModifiedBy: Relation<CnUser>;
}

export class CnEntityDTO extends BlEntityWithIdDTO {
  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  @Type(() => CnUserEntity)
  createdBy: CnUser;

  @ClLuxonDateTimeTransform()
  lastModifiedAt: DateTime;

  @Type(() => CnUserEntity)
  lastModifiedBy: CnUser;

  copyEntity(entity: CnEntity): this {
    super.copyEntity(entity);
    this.createdAt = entity.createdAt;
    this.createdBy = entity.createdBy;
    this.lastModifiedAt = entity.lastModifiedAt;
    this.lastModifiedBy = entity.lastModifiedBy;
    return this;
  }
}
