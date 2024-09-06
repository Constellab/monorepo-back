import { BlEntityWithId, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { Type } from 'class-transformer';
import { CnUser } from '../../cn-users/cn-user.entity';
import { JoinColumn, ManyToOne, OneToOne, Relation } from 'typeorm';
import { CnFolderHierarchyEntity } from './cn-folder-hierarchy.entity';
import { CnFolderHierarchyInfo } from './cn-folder-hierarchy.dto';

export abstract class CnFolderObject extends BlEntityWithId {

  /**
   * Representation of this object in the folder structure
   */
  @JoinColumn({ name: 'id' })
  @OneToOne(() => CnFolderHierarchyEntity, { cascade: ['insert'] })
  folderHierarchy: CnFolderHierarchyEntity;

  @BlLuxonDateTimeColumn({ nullable: false, update: false })
  createdAt: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, { eager: true, nullable: false })
  @BlNotUpdatable()
  createdBy: Relation<CnUser>;

  @BlLuxonDateTimeColumn()
  lastModifiedAt: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, { eager: true })
  lastModifiedBy: Relation<CnUser>;

  abstract getFolderObjectInfo(): CnFolderHierarchyInfo;
}
