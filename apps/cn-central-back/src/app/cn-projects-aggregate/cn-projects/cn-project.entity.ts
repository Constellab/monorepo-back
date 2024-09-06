import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, Relation } from 'typeorm';
import { Exclude, Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { BlLuxonDateColumn, BlRichTextContent } from '@monorepo/back-core-lib';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnBucket } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnFolderObject } from '../cn-folder-hierarchies/cn-folder-object.entity';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { ClDateHelper } from '@monorepo/core-lib';
import { CnFolderHierarchyInfo } from '../cn-folder-hierarchies/cn-folder-hierarchy.dto';


@Entity('project')
export class CnProject extends CnFolderObject {

  @Column({ nullable: false, length: 100 })
  title: string;

  @Column({ nullable: true, length: 20 })
  code: string;

  // this column is not selected by default
  @Exclude()
  @Column({ type: 'simple-json', nullable: true, select: false })
  description: BlRichTextContent;

  @BlLuxonDateColumn({ nullable: true })
  startingDate: DateTime;

  @BlLuxonDateColumn({ nullable: true })
  endingDate: DateTime;

  // TODO A voir si on garde
  @Type(() => CnUser)
  @ManyToOne(() => CnUser, { eager: true, nullable: false })
  leader: Relation<CnUser>;

  @Exclude()
  @ManyToOne(() => CnBucket, { nullable: false })
  mainStorage: CnBucket;

  @Exclude()
  @ManyToOne(() => CnBucket, { nullable: false })
  backupStorage: CnBucket;

  @Column({ nullable: false, default: false })
  chatEnabled: boolean;

  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedInfo(): void {
    this.lastModifiedBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }

  getFolderObjectInfo(): CnFolderHierarchyInfo {
    return {
      name: this.title,
      user: this.leader,
      lastModifiedAt: this.lastModifiedAt,
    };
  }
}

export type CnProjectWithFolder = Omit<CnProject, 'mainStorage' | 'backupStorage' | 'description'>;

export type CnProjectSimple = Omit<CnProjectWithFolder, 'folderHierarchy'>;

export type CnProjectWithStorage = Omit<CnProject, 'folderHierarchy' | 'description'>;
