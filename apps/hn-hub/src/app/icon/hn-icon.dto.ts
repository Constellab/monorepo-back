import {HnIconType} from './hn-icon.entity';

export class HnIconCreateDto {
  technicalName: string;
  name: string;
  subNames: string;
  type: HnIconType;
}
