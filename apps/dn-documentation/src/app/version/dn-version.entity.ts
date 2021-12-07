import { BlEntityWithId } from '@monorepo/back-core-lib';
import { Column, Entity } from 'typeorm';
import {DnBaseEntity} from '../core/model/entities/dn-base.entity';

@Entity('Version')
export class DnVersion extends DnBaseEntity{
  @Column({length: 20})
  versionNumber: string;
}
