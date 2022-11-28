import {Column, Entity} from 'typeorm';
import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';

@Entity('space')
export class CnSpace extends CnBaseEntity {

  @Column({nullable: false})
  name: string;

  @Column({nullable: true})
  photo: string;

  // front domain for this space
  @Column({length: 50, unique: true})
  domain: string;

  @Column({default: 0})
  nbLicenses: number;
}
