import {CnOrganizationUserRole} from './cn-organization-user.entity';


export interface CnOrganizationInvitDto {
  userMail: string;
  role: CnOrganizationUserRole;
}


export interface CnRequestNewLicensesDto {
  nbLicenses: number;
  text?: string;
}
