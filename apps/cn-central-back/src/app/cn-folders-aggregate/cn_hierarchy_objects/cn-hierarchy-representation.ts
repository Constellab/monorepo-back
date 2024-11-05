import { BlEntityWithId, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { Type } from 'class-transformer';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { JoinColumn, ManyToOne, OneToOne, Relation } from 'typeorm';
import { CnHierarchyObjectEntity } from './cn-hierarchy-object.entity';
import { CnHierarchyObjectInfo } from './cn-hierarchy-object.dto';

/**
 * Abstract class for object that can be represented in a hierarchy
 */
export abstract class CnHierarchyRepresentation extends BlEntityWithId {
  /**
   * Representation of this object in the hierarchy structure
   */
  @JoinColumn({ name: 'id' })
  @OneToOne(() => CnHierarchyObjectEntity, { cascade: ['insert'] })
  hierarchyRepresentation: CnHierarchyObjectEntity;

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

  abstract getHierarchyObjectInfo(): CnHierarchyObjectInfo;
}
