import {CnOrganization} from '../cn-organizations/cn-organization.entity';
import {CnUser} from './cn-user.entity';
import {CnOrganizationUserRole} from '../cn-organizations/cn-organization-user.entity';

/**
 * Object contains information of a user in an organization
 * If the objet exist, it means the user is member of the organization
 */
export class CnUserOrgaInfo {

  constructor(public user: CnUser, public organization: CnOrganization, public roleInOrga: CnOrganizationUserRole) {
  }

  get userId(): string {
    return this.user.id;
  }

  get organizationId(): string {
    return this.organization.id;
  }

  isAdmin(): boolean {
    return this.user.isAdmin();
  }

  isOrganizationAdmin(): boolean {
    return this.isAdmin() || this.roleInOrga === CnOrganizationUserRole.ADMIN;
  }
}
