import {LabInstance} from './lab-instance.entity';
import {Type} from 'class-transformer';

/**
 * Lab instance object with single use token to logon lab
 */
export class LabInstanceToken {

  @Type(() => LabInstance)
  labInstance: LabInstance;
  token: string;

  constructor(labInstance: LabInstance, token: string) {
    this.labInstance = labInstance;
    this.token = token;
  }
}
