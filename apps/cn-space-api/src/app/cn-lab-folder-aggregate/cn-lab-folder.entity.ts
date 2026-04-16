import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { BeforeInsert, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
} from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnLab, CnLabEntity } from '../cn-labs/cn-lab.entity';
import { CnUser, CnUserEntity } from '../cn-users/cn-user.entity';

/**
 * Entity for N to N relation between lab and folder shared to lab
 */
@Entity('lab_folder')
export class CnLabFolderEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  labId: string;

  @JoinColumn()
  @ManyToOne(() => CnLabEntity, (lab) => lab.sharedGroups, { onDelete: 'CASCADE', nullable: false })
  lab: CnLab;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  rootFolderId: string;

  @Type(() => CnHierarchyObjectEntity)
  @JoinColumn()
  @ManyToOne(() => CnHierarchyObjectEntity, { nullable: false })
  rootFolder: CnHierarchyObject;

  @BlLuxonDateTimeColumn({ nullable: false, update: false })
  createdAt: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  @BlNotUpdatable()
  createdBy: Relation<CnUser>;

  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }
}

export type CnLabFolder = Omit<CnLabFolderEntity, 'lab' | 'rootFolder'>;

export type CnLabFolderWithRootFolder = Omit<CnLabFolderEntity, 'lab'>;

export type CnLabFolderWithLab = Omit<CnLabFolderEntity, 'rootFolder'>;
