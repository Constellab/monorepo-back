import {HaEntity} from './ha-entity.class';
import {HaBrick} from './ha-brick.class';
import {Type} from 'class-transformer';

export enum HaVersionState {
  STABLE = 'STABLE',
  LATEST = 'LATEST',
  NEXT = 'NEXT'
}

export class HaBrickMajorVersion extends HaEntity {
  @Type(() => HaBrick)
  brick: HaBrick;
  major: number;
  versionState: HaVersionState;
}
