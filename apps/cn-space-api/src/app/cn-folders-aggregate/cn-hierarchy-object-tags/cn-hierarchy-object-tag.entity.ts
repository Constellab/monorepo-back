import { BlNotUpdatable } from '@monorepo/back-core-lib';
import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
} from '../cn-hierarchy-objects/cn-hierarchy-object.entity';

@Unique('hierarchy_object_tag_key_value_lab', ['key', 'value', 'hierarchyObject'])
@Entity('hierarchy_object_tag')
export class CnHierarchyObjectTagEntity extends CnBaseEntity {
  @Column({ nullable: false, length: 50, update: false, name: 'tagKey' })
  key: string;

  @Column({ nullable: false, length: 50, update: false, name: 'tagValue' })
  value: string;

  @Exclude()
  @BlNotUpdatable()
  @ManyToOne(() => CnHierarchyObjectEntity, { nullable: false, onDelete: 'CASCADE' })
  hierarchyObject: CnHierarchyObject;
}

export type CnHierarchyObjectTag = Omit<CnHierarchyObjectTagEntity, 'hierarchyObject'>;
