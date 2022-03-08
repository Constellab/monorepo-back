import {Column, Entity, ManyToOne} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {CnGroup} from '../../cn-groups/cn-group.entity';
import {Exclude} from 'class-transformer';

export enum SnSmartDbType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}


@Entity('smart_db')
export class SnSmartDbEntity extends CnBaseEntity {

  @Column()
  name: string;

  // name of the elastic search index
  @Column()
  @Exclude()
  dbIndex: string;

  @Column({type: 'enum', enum: SnSmartDbType, nullable: true})
  type: SnSmartDbType;


  @ManyToOne(() => CnGroup, {eager: true})
  group: CnGroup;

  @Column()
  groupId: string;
}
