import { CnSpace } from '../cn-spaces/cn-space.entity';
import { CnUser, CnUserLicense } from './cn-user.entity';
import { CnSpaceUserRole } from '../cn-spaces/cn-space-user.entity';

export interface CnCreateUserDto {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone?: string;
  captcha?: string;
}

/**
 * Object contains information of a user in a space
 * If the objet exist, it means the user is member of the space
 */
export class CnUserSpaceInfo {
  constructor(
    public user: CnUser,
    public space: CnSpace,
    public roleInSpace: CnSpaceUserRole
  ) {}

  get userId(): string {
    return this.user.id;
  }

  get spaceId(): string {
    return this.space.id;
  }

  isAdmin(): boolean {
    return this.user.isAdmin();
  }

  isSpaceAdmin(): boolean {
    return this.isAdmin() || this.roleInSpace === CnSpaceUserRole.ADMIN;
  }
}

export interface CnUserUpdateLicenseDTO {
  license: CnUserLicense;
}
