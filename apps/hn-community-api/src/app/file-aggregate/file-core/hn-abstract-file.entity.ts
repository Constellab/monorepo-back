import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { BeforeInsert, Column, ManyToOne, Unique } from 'typeorm';
import { DateTime } from 'luxon';
import { Type } from 'class-transformer';
import { HnUser } from '../../users/hn-user.entity';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { ClDateHelper } from '@monorepo/core-lib';

export enum HnFileType {
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  RESOURCE_VIEW = 'RESOURCE_VIEW',
}

@Unique(['entity', 'name'])
@Unique(['fileName'])
export abstract class HnAbstractFileEntity<T extends BlEntityWithId> extends BlEntityWithId {
  @Column({ type: 'enum', enum: HnFileType, default: HnFileType.FILE })
  type: HnFileType;

  @Column({ nullable: false })
  fileName: string;

  @Column({ nullable: false })
  name: string;

  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  createdAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  createdBy?: HnUser;

  @Column({ nullable: true })
  size?: number;

  abstract entity: T;

  init(entity: T, fileName: string, type: HnFileType, name: string = null, size: number = null): void {
    this.entity = entity;
    this.fileName = fileName;
    this.name = name;
    this.size = size;
    this.type = type;
  }

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = HnCurrentUserHelper.getCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }
}
