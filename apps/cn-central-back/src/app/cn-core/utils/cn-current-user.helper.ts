import {BlCurrentUserHelper} from '@monorepo/back-core-lib';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnLabInstance} from '../../cn-lab-instances/cn-lab-instance.entity';
import {UnauthorizedException} from '@nestjs/common';
import {CnOrganization} from '../../cn-organizations/cn-organization.entity';
import {CnOrganizationUserRole} from '../../cn-organizations/cn-organization-user.entity';
import {CnUserOrgaInfo} from '../../cn-users/cn-user.dto';

export interface CnRequestAuthInfo {
  labInstance?: CnLabInstance;
  organization?: CnOrganization;
  // role for the current user in this organization
  roleInOrga: CnOrganizationUserRole;
}

export class CnCurrentUserHelper extends BlCurrentUserHelper {


  /**
   * returns the current authenticated user or null if not authenticated
   */
  static getCurrentUser(): CnUser | null {
    return super.getCurrentUser() as CnUser;
  }

  /**
   * returns the current authenticated user or throw a Unauthorized exception
   * if the user is not authenticated
   */
  static getAndCheckCurrentUser(): CnUser {
    return super.getAndCheckCurrentUser() as CnUser;
  }

  /**
   * returns the current authenticated labInstance for routes annotated with @LabAuth
   */
  static getAndCheckCurrentLabInstance(): CnLabInstance {
    const labInstance: CnLabInstance = this.getCurrentLabInstance();

    if (labInstance == null) {
      throw new UnauthorizedException("No labInstance in the context");
    }

    return labInstance;
  }

  /**
   * returns the current authenticated labInstance for routes annotated with @LabAuth
   * or null if not authenticated
   */
  static getCurrentLabInstance(): CnLabInstance | null {
    return this.getAdditionalInfo()?.labInstance ?? null;
  }

  static setCurrentLabInstance(labInstance: CnLabInstance): void {
    this.setAdditionalData('labInstance', labInstance);
  }

  /**
   * return the current organization or throw an Unauthorized exception
   * if there is no organization in the context
   */
  static getAndCheckCurrentOrganization(): CnOrganization {
    const organization: CnOrganization = this.getCurrentOrganization();

    if (organization == null) {
      throw new UnauthorizedException("No organization in the context");
    }

    return organization;
  }

  /**
   * return the current organization or null if there is no organization in the context
   */
  static getCurrentOrganization(): CnOrganization | null {
    return this.getAdditionalInfo()?.organization ?? null;
  }

  static setCurrentOrganization(organization: CnOrganization): void {
    this.setAdditionalData('organization', organization);
  }

  /**
   * return the role of the current user for the current organization
   */
  static getAndCheckCurrentRoleInOrga(): CnOrganizationUserRole {
    const role: CnOrganizationUserRole = this.getCurrentRoleInOrga();

    if (role == null) {
      throw new UnauthorizedException("No role in the context");
    }

    return role;
  }

  /**
   * return the role of the current user for the current organization
   * or null if there is no organization in the context
   */
  static getCurrentRoleInOrga(): CnOrganizationUserRole | null {
    return this.getAdditionalInfo()?.roleInOrga ?? null;
  }

  static isAdminOfCurrentOrganization(): boolean {
    return this.getAndCheckCurrentRoleInOrga() === CnOrganizationUserRole.ADMIN;
  }

  static setCurrentRoleInOrga(role: CnOrganizationUserRole): void {
    this.setAdditionalData('roleInOrga', role);
  }

  static getAndCheckUserOrgaInfo(): CnUserOrgaInfo {
    return new CnUserOrgaInfo(this.getAndCheckCurrentUser(),
      this.getAndCheckCurrentOrganization(),
      this.getAndCheckCurrentRoleInOrga());
  }


  static getAdditionalInfo(): CnRequestAuthInfo | null {
    return this.getCurrentAdditionalData();
  }
}
