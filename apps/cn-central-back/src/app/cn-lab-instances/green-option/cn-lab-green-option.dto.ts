import {CnLabGreenOptionType} from './cn-lab-green-option.entity';


export interface CnLabGreenOptionFormDto {

  type: CnLabGreenOptionType;

  value: any;

  isPersistent: boolean;
}
