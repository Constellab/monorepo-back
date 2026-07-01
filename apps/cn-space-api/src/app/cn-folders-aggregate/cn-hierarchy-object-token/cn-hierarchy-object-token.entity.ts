import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { Column, Entity, ManyToOne } from 'typeorm';

import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
} from '../cn-hierarchy-objects/cn-hierarchy-object.entity';

@Entity('hierarchy_object_token')
export class CnHierarchyObjectTokenEntity extends CnBaseEntity {
  @BlNotUpdatable()
  @Type(() => CnHierarchyObjectEntity)
  @ManyToOne(() => CnHierarchyObjectEntity, { nullable: false, eager: true, onDelete: 'CASCADE' })
  hierarchyObject: CnHierarchyObject;

  @Column({ nullable: false, update: false, length: 36 })
  hierarchyObjectId: string;

  @Column({ nullable: false, update: false })
  token: string;

  @BlLuxonDateTimeColumn({ nullable: true })
  expirationDate: DateTime;

  isValid(): boolean {
    return this.expirationDate == null || this.expirationDate > DateTime.now();
  }
}

export type CnHierarchyObjectToken = Omit<CnHierarchyObjectTokenEntity, 'hierarchyObject'>;
