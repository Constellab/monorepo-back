import {LabInstance} from './lab-instance.entity';

/**
 * Lab instance object with single use token to logon lab
 */
export interface LabInstanceToken {
  labInstance: LabInstance;
  token: string;
}
