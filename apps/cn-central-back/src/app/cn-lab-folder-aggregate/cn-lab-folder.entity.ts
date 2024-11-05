import { BeforeInsert, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';
import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { Type } from 'class-transformer';
import { CnUser, CnUserEntity } from '../cn-users/cn-user.entity';
import { CnLabEntity } from '../cn-labs/cn-lab.entity';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { ClDateHelper } from '@monorepo/core-lib';
import { CnHierarchyObjectEntity } from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.entity';

/**
 * Entity for N to N relation between lab and folder shared to lab
 */
@Entity('lab_folder')
export class CnLabFolderEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  labId: string;

  @JoinColumn({ name: 'labId' })
  @ManyToOne(() => CnLabEntity, (lab) => lab.sharedGroups, { onDelete: 'CASCADE' })
  lab: CnLabEntity;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  rootFolderId: string;

  @Type(() => CnHierarchyObjectEntity)
  @JoinColumn({ name: 'rootFolderId' })
  @ManyToOne(() => CnHierarchyObjectEntity)
  rootFolder: CnHierarchyObjectEntity;

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
