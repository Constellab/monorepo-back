import {CnOrganizationUserRole} from './cn-organization-user.entity';
import {CnOrganization} from './cn-organization.entity';
import {CnUser} from '../cn-users/cn-user.entity';


export interface CnOrganizationInvitDto{
  userMail: string;
  role: CnOrganizationUserRole;
}

export interface CnOrganizationInfoDto{
  organization: CnOrganization;
  user: CnUser;
  // role for this user in the organization
  roleInOrga: CnOrganizationUserRole;
}
