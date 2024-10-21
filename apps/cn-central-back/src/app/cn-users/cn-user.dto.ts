import { CnSpace } from '../cn-spaces/cn-space.entity';
import { CnUser, CnUserLicense } from './cn-user.entity';
import { CnSpaceUserRole } from '../cn-spaces/cn-space-user.entity';
import { BlUserCategory } from '@monorepo/back-core-lib';

export class CnUserBasicDto{
  id: string;
  firstname: string;
  lastname: string;
  photo: string;

  constructor(user: CnUser){
    this.id = user.id;
    this.firstname = user.firstname;
    this.lastname = user.lastname;
    this.photo = user.photo;
  }
}

export interface CnCreateUserDto {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  category: BlUserCategory;
  phone?: string;
  captcha?: string;
}

/**
 * Object contains information of a user in a space
 * If the objet exist, it means the user is member of the space
 */
export class CnUserSpaceInfo {

  constructor(public user: CnUser, public space: CnSpace, public roleInSpace: CnSpaceUserRole) {
  }

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
