import {Column, Entity, ManyToOne} from 'typeorm';
import {BaseEntity} from '../core/model/entities/base.entity';
import {Lab} from '../labs/lab.entity';

/**
 * A brick is a functionality in a Lab
 * A lab is configured with multiple bricks
 */
@Entity()
export class Brick extends BaseEntity {

  // @Column({nullable: false})
  // uri: string;

  @Column({nullable: false})
  label: string;

  @ManyToOne(() => Lab, (lab: Lab) => lab.bricks)
  lab: Lab;
}
