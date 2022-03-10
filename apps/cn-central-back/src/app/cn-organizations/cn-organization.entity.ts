import {Column, Entity, OneToOne} from 'typeorm';
import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';
import {CnGroupOrganization} from '../cn-groups/cn-group.entity';

@Entity('organisation')
export class CnOrganization extends CnBaseEntity {

  @Column({nullable: false})
  label: string;

  @Column({nullable: true})
  photo: string;

  @OneToOne(() => CnGroupOrganization,
    group => group.organization, {eager: true, nullable: false})
  group: CnGroupOrganization;
}
