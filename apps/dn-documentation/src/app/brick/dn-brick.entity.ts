import {DnBaseEntity} from '../core/model/entities/dn-base.entity';
import {Column, Entity} from 'typeorm';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

export class DnCreateBrickDTO{
  name: string;
  description: string;
  version?: number[];
}

export class DnUpdateBrickDTO{
  description: string;
  isCertified: boolean;
}

export class DnBrickDTO{
  name: string;
  description: string;
}

@Entity('Brick')
export class DnBrick extends DnBaseEntity{
  @BlNotUpdatable()
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  isCertified: boolean;

  constructor(brickDTO: DnBrickDTO) {
    super();
    if(brickDTO != null){
      this.name = brickDTO.name;
      this.description = brickDTO.description;
      this.isCertified = false;
    }
  }

}
