import {HaEntity} from './ha-entity.class';

export class HaBrick extends HaEntity {
  name: string;

  desciption: string;

  isCertified: boolean;
}


export class HaBrickDTO {
  name: string;

  description: string;

  version?: string;
}
