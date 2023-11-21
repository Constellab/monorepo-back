import {Column, Entity} from 'typeorm';
import {HnBaseEntity} from '../../core/model/entities/hn-base.entity';

export enum HnSpaceType {
  // personal space create on the user creation (he cas invite other users in his space)
  PERSONAL = 'PERSONAL',
  // basic space created by a user
  BASIC = 'BASIC',
}

@Entity('Space')
export class HnSpace extends HnBaseEntity {
  @Column({nullable: false})
  name: string;

  @Column({nullable: true})
  photo: string;

  @Column({length: 50, unique: true})
  domain: string;

  @Column({type: 'enum', enum: HnSpaceType, nullable: false, update: false})
  type: HnSpaceType;
}
