import {ManyToOne, Relation} from 'typeorm';
import {CnUser} from '../../../cn-users/cn-user.entity';
import {Type} from 'class-transformer';
import {DateTime} from 'luxon';
import {BlEntityWithId, BlEntityWithIdDTO, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';

/**
 * Basic entity with same info as CnBaseEntity
 * but without the @BeforeInsert() and @BeforeUpdate() methods
 * The creation and modification info need to be set manually
 */
export abstract class CnEntity extends BlEntityWithId {

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  // @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  createdBy: Relation<CnUser>;

  @BlLuxonDateTimeColumn()
  lastModifiedAt: DateTime;

  // @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true})
  lastModifiedBy: Relation<CnUser>;
}

export class CnEntityDTO extends BlEntityWithIdDTO {
  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  @Type(() => CnUser)
  createdBy: CnUser;

  @ClLuxonDateTimeTransform()
  lastModifiedAt: DateTime;

  @Type(() => CnUser)
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
