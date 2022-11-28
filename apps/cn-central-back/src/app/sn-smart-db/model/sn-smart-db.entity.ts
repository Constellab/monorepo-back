import {Column, Entity, ManyToOne} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {CnGroup} from '../../cn-groups/cn-group.entity';
import {Exclude} from 'class-transformer';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnSpace} from '../../cn-spaces/cn-space.entity';

export enum SnSmartDbType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}


@Entity('smart_db')
export class SnSmartDbEntity extends CnBaseEntity {

  @Column()
  name: string;

  // name of the elastic search index
  @Column({update: false})
  @Exclude()
  dbIndex: string;

  @Column({type: 'enum', enum: SnSmartDbType, nullable: true})
  type: SnSmartDbType;


  @BlNotUpdatable()
  @ManyToOne(() => CnGroup, {eager: true})
  group: CnGroup;

  @Column({update: false})
  groupId: string;

  @Exclude()
  @BlNotUpdatable()
  @ManyToOne(() => CnSpace, {nullable: false})
  space?: CnSpace;

  @Column({nullable: false, update: false})
  spaceId: string;

}
