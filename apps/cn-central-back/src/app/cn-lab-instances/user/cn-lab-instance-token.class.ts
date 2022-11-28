import {CnLabInstance} from '../cn-lab-instance.entity';
import {Type} from 'class-transformer';

/**
 * Lab instance object with single use token to logon lab
 */
export class CnLabInstanceToken {

  @Type(() => CnLabInstance)
  labInstance: CnLabInstance;
  token: string;

  constructor(labInstance: CnLabInstance, token: string) {
    this.labInstance = labInstance;
    this.token = token;
  }
}
