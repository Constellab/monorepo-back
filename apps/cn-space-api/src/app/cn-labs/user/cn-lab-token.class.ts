import { CnLab, CnLabEntity } from '../cn-lab.entity';
import { Type } from 'class-transformer';

/**
 * Lab instance object with single use token to logon lab
 */
export class CnLabToken {
  @Type(() => CnLabEntity)
  lab: CnLab;
  token: string;

  constructor(lab: CnLab, token: string) {
    this.lab = lab;
    this.token = token;
  }
}
