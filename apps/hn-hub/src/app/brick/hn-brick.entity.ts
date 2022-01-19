import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {Column, Entity} from 'typeorm';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

export class HnCreateBrickDTO{
  name: string;
  description: string;
  version?: number[];
}

export class HnUpdateBrickDTO{
  description: string;
  isCertified: boolean;
}

export class HnBrickDTO{
  name: string;
  description: string;
}

@Entity('Brick')
export class HnBrick extends HnBaseEntity{
  @BlNotUpdatable()
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  isCertified: boolean;

  initialize(name: string, description: string, isCertified: boolean){
    this.name = name;
    this.description = description;
    this.isCertified = isCertified;
  }

}
