import {Column, Entity} from 'typeorm';
import {BaseEntity} from '../core/model/entities/base.entity';

@Entity()
export class Organization extends BaseEntity {

  @Column({nullable: false})
  label: string;

  @Column({nullable: true})
  photo: string;
}
