import { BeforeInsert, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';
import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { Type } from 'class-transformer';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnLabInstance } from '../cn-lab-instances/cn-lab-instance.entity';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { ClDateHelper } from '@monorepo/core-lib';
import { CnHierarchyObjectEntity } from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.entity';

/**
 * Entity for N to N relation between lab instance and folder shared to lab
 */
@Entity('lab_folder')
export class CnLabFolderEntity {

  @PrimaryColumn({ type: 'varchar', length: 36 })
  labInstanceId: string;

  @JoinColumn({name: 'labInstanceId'})
  @ManyToOne(() => CnLabInstance,
    labInstance => labInstance.sharedGroups, {onDelete: 'CASCADE'})
  labInstance: CnLabInstance;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  rootFolderId: string;

  @Type(() => CnHierarchyObjectEntity)
  @JoinColumn({name: 'rootFolderId'})
  @ManyToOne(() => CnHierarchyObjectEntity)
  rootFolder: CnHierarchyObjectEntity;

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  @BlNotUpdatable()
  createdBy: Relation<CnUser>;

  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }
}

export type CnLabFolder = Omit<CnLabFolderEntity, 'labInstance' | 'rootFolder'>;

export type CnLabFolderWithRootFolder = Omit<CnLabFolderEntity, 'labInstance'>;

export type CnLabFolderWithLab = Omit<CnLabFolderEntity, 'rootFolder'>;
