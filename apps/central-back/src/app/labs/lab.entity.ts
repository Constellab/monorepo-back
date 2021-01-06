import {Column, Entity, OneToMany} from 'typeorm';
import {BaseEntity} from '../core/model/entities/base.entity';
import {Brick} from '../bricks/brick.entity';

/**
 * A lab defined a environment to execute experiments
 * It contains a list of brick to defined available functionalities
 */
@Entity()
export class Lab extends BaseEntity {

  @Column({nullable: false, length: 50})
  label: string;

  @OneToMany(() => Brick, (brick: Brick) => brick.lab)
  bricks: Brick[];
}
