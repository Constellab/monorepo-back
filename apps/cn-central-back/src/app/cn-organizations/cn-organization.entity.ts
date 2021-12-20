import {Column, Entity} from 'typeorm';
import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';

@Entity('organisation')
export class CnOrganization extends CnBaseEntity {

  @Column({nullable: false})
  label: string;

  @Column({nullable: true})
  photo: string;
}
