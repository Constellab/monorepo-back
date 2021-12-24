import {DaEntity} from './da-entity.class';

export class DaBrick extends DaEntity{
  name: string;

  desciption: string;

  isCertified: boolean;
}


export class DaBrickDTO{
  name: string;

  description: string;

  version?: string;
}
