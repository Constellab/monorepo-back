import { HnIconType } from './hn-icon.entity';

export class HnIconCreateDto {
  id?: string;
  technicalName: string;
  name: string;
  subNames: string;
  type: HnIconType;
}
