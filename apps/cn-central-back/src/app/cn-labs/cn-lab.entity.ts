import {Column, Entity, OneToMany} from 'typeorm';
import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';
import {CnBrick} from '../cn-bricks/cn-brick.entity';

/**
 * A lab defined an environment to execute experiments
 * It contains a list of brick to defined available functionalities
 */
@Entity('lab')
export class CnLab extends CnBaseEntity {

  @Column({nullable: false, length: 50})
  label: string;

  @OneToMany(() => CnBrick, (brick: CnBrick) => brick.lab)
  bricks: CnBrick[];
}
