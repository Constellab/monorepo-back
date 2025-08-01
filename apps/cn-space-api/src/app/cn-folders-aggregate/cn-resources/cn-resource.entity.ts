import { BlNotUpdatable } from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';

import { CnTypeStyle } from '../../cn-core/model/config/cn-type-style.class';
import { CnLab, CnLabEntity } from '../../cn-labs/cn-lab.entity';
import { CnHierarchyObjectInfo } from '../cn-hierarchy-objects/cn-hierarchy-object.dto';
import { CnHierarchyObjectType } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyRepresentation } from '../cn-hierarchy-objects/cn-hierarchy-representation';

@Entity('resource')
export class CnResourceEntity extends CnHierarchyRepresentation {
  @Column({ nullable: false, length: 36 })
  resourceId: string;

  @Column({ nullable: false, length: 255 })
  name: string;

  @Column({ nullable: false, length: 255 })
  typingName: string;

  @Column({ nullable: false, type: 'simple-json' })
  style: CnTypeStyle;

  @Column({ nullable: false, length: 255 })
  token: string;

  @BlNotUpdatable()
  @Type(() => CnLabEntity)
  @ManyToOne(() => CnLabEntity, { nullable: false, eager: false })
  lab: CnLab;

  getHierarchyObjectInfo(): CnHierarchyObjectInfo {
    return {
      objectType: CnHierarchyObjectType.RESOURCE,
      name: this.name,
      lastModifiedAt: this.createdAt,
      user: this.createdBy,
      style: this.style,
    };
  }
}

export type CnResource = Omit<CnResourceEntity, 'hierarchyRepresentation' | 'lab'>;
export type CnResourceWithLab = Omit<CnResourceEntity, 'hierarchyRepresentation'>;
