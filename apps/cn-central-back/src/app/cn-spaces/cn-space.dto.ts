import {CnSpaceUserRole} from './cn-space-user.entity';


export interface CnSpaceInvitDto {
  userMail: string;
  role: CnSpaceUserRole;
}


export interface CnRequestNewLicensesDto {
  nbLicenses: number;
  text?: string;
}

export interface CnRequestNewLabDto{

  text?: string;
}
