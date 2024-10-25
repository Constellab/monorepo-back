import { Column, Entity, ManyToOne, Relation } from 'typeorm';
import { BlEntityWithId, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { Exclude, Expose, Type } from 'class-transformer';
import { CnUser, CnUserEntity } from '../cn-users/cn-user.entity';
import { DateTime } from 'luxon';
import { CnSpace } from '../cn-spaces/cn-space.entity';


export enum CnActivityType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum CnActivityEntityType {
  USER = 'USER',
  FOLDER = 'FOLDER',
  SCENARIO = 'SCENARIO',
  NOTE = 'NOTE',
  DOCUMENT = 'DOCUMENT',
  MESSAGE = 'MESSAGE',
}

@Entity('activity')
export class CnActivity extends BlEntityWithId {

  @Column({type: 'enum', enum: CnActivityEntityType, update: false})
  entityType: CnActivityEntityType;

  @Column({update: false})
  entityId: string;

  @Column({update: false})
  entityName: string;

  @Column({type: 'enum', enum: CnActivityType, update: false})
  actionType: CnActivityType;

  @Exclude()
  @Column({update: false})
  title: string;

  @Column({update: false})
  userId: string;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, {eager: true, nullable: false})
  @BlNotUpdatable()
  user: Relation<CnUser>;

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Column({update: false, nullable: true})
  spaceId: string | null;

  @Type(() => CnSpace)
  @ManyToOne(() => CnSpace, {nullable: true})
  @BlNotUpdatable()
  space: Relation<CnSpace> | null;

  @Column({update: false, nullable: true})
  parentEntityId: string | null;

  @Expose({name: 'title'})
  get cleanTitle(): string {
    // replace {{user.name}} with user.alias
    // replace {{entityName}} with entityName
    return this.title.replace('{{user.name}}', this.user.alias)
      .replace('{{entityName}}', this.entityName);
  }
}
