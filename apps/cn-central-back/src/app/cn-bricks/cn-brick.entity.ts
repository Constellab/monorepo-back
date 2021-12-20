import {Column, Entity, ManyToOne} from 'typeorm';
import {CnBaseEntity} from '../cn-core/model/entities/cn-base.entity';
import {CnLab} from '../cn-labs/cn-lab.entity';

/**
 * A brick is a functionality in a Lab
 * A lab is configured with multiple bricks
 */
@Entity('brick')
export class CnBrick extends CnBaseEntity {

  @Column({nullable: false})
  label: string;

  @ManyToOne(() => CnLab, (lab: CnLab) => lab.bricks)
  lab: CnLab;
}
