import { BlNotUpdatable } from '@monorepo/back-core-lib';
import { Column, Entity, ManyToOne } from 'typeorm';

import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
} from '../cn-hierarchy-objects/cn-hierarchy-object.entity';

export enum CnHierarchyObjectTagHistoryType {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
}

/**
 * Table to store the history of tags on hierarchy objects.
 * It stores creation and deletion info.
 */
@Entity('hierarchy_object_tag_history')
export class CnHierarchyObjectTagHistoryEntity extends CnBaseEntity {
  @Column({ nullable: false, length: 50, update: false, name: 'tagKey' })
  key: string;

  @Column({ nullable: false, length: 50, update: false, name: 'tagValue' })
  value: string;

  @BlNotUpdatable()
  @ManyToOne(() => CnHierarchyObjectEntity, { nullable: false, onDelete: 'CASCADE' })
  hierarchyObject: CnHierarchyObject;

  @Column({ nullable: false, type: 'enum', enum: CnHierarchyObjectTagHistoryType })
  type: CnHierarchyObjectTagHistoryType;
}

export type CnHierarchyObjectTagHistory = Omit<CnHierarchyObjectTagHistoryEntity, 'hierarchyObject'>;
