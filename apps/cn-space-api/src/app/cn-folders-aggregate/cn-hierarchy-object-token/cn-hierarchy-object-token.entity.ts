import { Column, Entity, ManyToOne } from 'typeorm';
import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
} from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { DateTime } from 'luxon';

@Entity('hierarchy_object_token')
export class CnHierarchyObjectTokenEntity extends CnBaseEntity {
  @BlNotUpdatable()
  @Type(() => CnHierarchyObjectEntity)
  @ManyToOne(() => CnHierarchyObjectEntity, { nullable: false, eager: true })
  hierarchyObject: CnHierarchyObject;

  @Column({ nullable: false, update: false })
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
