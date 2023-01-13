import {CnSpaceUserRole} from './cn-space-user.entity';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnSpaceInvit} from './cn-space-invit.entity';


export interface CnSpaceInvitCreateDto {
  userMail: string;
  role: CnSpaceUserRole;
}


export interface CnRequestNewLicensesDto {
  nbLicenses: number;
  text?: string;
}

export interface CnSpaceInvitReadDto{

  invitation: CnSpaceInvit;

  // provided if the email in the invitation corresponds to an existing user
  existingUser?: CnUser;
}
