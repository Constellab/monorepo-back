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

  constructor(brickDTO: HnBrickDTO) {
    super();
    if(brickDTO != null){
      this.name = brickDTO.name;
      this.description = brickDTO.description;
      this.isCertified = false;
    }
  }

}
