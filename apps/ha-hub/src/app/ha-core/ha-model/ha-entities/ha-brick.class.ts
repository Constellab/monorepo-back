import {HaEntity} from './ha-entity.class';
import {CmVersion} from '@monorepo/common-model';

export class HaBrick extends HaEntity {
  name: string;

  description: string;

  isCertified: boolean;
}


export class HaBrickDTO {
  id?: string;

  name: string;

  description: string;

  version: string|CmVersion;

  isBeta: boolean = false;

  subPatch?: number;
}
