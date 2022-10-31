import {CnOrganizationUserRole} from './cn-organization-user.entity';


export interface CnOrganizationInvitDto {
  userMail: string;
  role: CnOrganizationUserRole;
}

