import { CnHierarchyObject } from '../../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnLab } from '../../cn-labs/cn-lab.entity';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { CnSpaceUserRole } from '../../cn-spaces/cn-space-user.entity';
import { CnUserSpaceInfo } from '../../cn-users/cn-user.dto';
import { CnUser } from '../../cn-users/cn-user.entity';

abstract class CnAuthContextBase {
  type!:
    | 'user'
    | 'labDev'
    | 'labProd'
    | 'labManager'
    | 'labToken'
    | 'userNoSpace'
    | 'cron'
    | 'hierarchyObjectToken';

  abstract getUser(): CnUser | null;

  abstract getSpace(): CnSpace | null;

  abstract getRoleInSpace(): CnSpaceUserRole | null;

  abstract getLab(): CnLab | null;
}

/**
 * Auth context when the user is authenticated but there is no space (it should not happen)
 */
export class CnAuthContextUserNoSpace extends CnAuthContextBase {
  type = 'userNoSpace' as const;

  constructor(public user: CnUser) {
    super();
  }

  getUser(): CnUser {
    return this.user;
  }

  getSpace(): null {
    return null;
  }

  getRoleInSpace(): null {
    return null;
  }

  getLab(): null {
    return null;
  }
}

/**
 * Main Auth context when the user is authenticated and is in a space
 */
export class CnAuthContextUser extends CnAuthContextBase {
  type = 'user' as const;

  constructor(public userInfo: CnUserSpaceInfo) {
    super();
  }

  getUser(): CnUser {
    return this.userInfo.user;
  }

  getSpace(): CnSpace {
    return this.userInfo.space;
  }

  getRoleInSpace(): CnSpaceUserRole {
    return this.userInfo.roleInSpace;
  }

  getLab(): null {
    return null;
  }
}

/**
 * Auth for request coming from the lab.
 * labProd if the request is made from the production environment (prod api)
 * labDev if the request is made from the development environment (dev api from codelab)
 */
export class CnAuthContextLab extends CnAuthContextBase {
  type: 'labProd' | 'labDev';

  constructor(
    type: 'labProd' | 'labDev',
    public userInfo: CnUserSpaceInfo,
    public lab: CnLab
  ) {
    super();
    this.type = type;
  }

  getUser(): CnUser {
    return this.userInfo.user;
  }

  getSpace(): CnSpace {
    return this.userInfo.space;
  }

  getRoleInSpace(): CnSpaceUserRole {
    return this.userInfo.roleInSpace;
  }

  getLab(): CnLab {
    return this.lab;
  }
}

/**
 * Auth for request coming from the lab if the request is made from the lab using a token
 */
export class CnAuthContextLabToken extends CnAuthContextBase {
  type = 'labToken' as const;

  constructor(
    public user: CnUser,
    public space: CnSpace,
    public lab: CnLab
  ) {
    super();
  }

  getUser(): CnUser {
    return this.user;
  }

  getSpace(): CnSpace {
    return this.space;
  }

  getRoleInSpace(): null {
    return null;
  }

  getLab(): CnLab {
    return this.lab;
  }
}

/**
 * LabManager if the request is made from the lab manager
 */
export class CnAuthContextLabManager extends CnAuthContextBase {
  type = 'labManager' as const;

  constructor(
    public userInfo: CnUserSpaceInfo,
    public lab: CnLab,
    public labManagerVersion: string | undefined
  ) {
    super();
  }

  getUser(): CnUser {
    return this.userInfo.user;
  }

  getSpace(): CnSpace {
    return this.userInfo.space;
  }

  getRoleInSpace(): CnSpaceUserRole {
    return this.userInfo.roleInSpace;
  }

  getLab(): CnLab {
    return this.lab;
  }
}

/**
 * Auth for cron jobs
 */
export class CnAuthContextCron extends CnAuthContextBase {
  type = 'cron' as const;

  constructor(public user: CnUser) {
    super();
  }

  getUser(): CnUser {
    return this.user;
  }

  getSpace(): null {
    return null;
  }

  getRoleInSpace(): null {
    return null;
  }

  getLab(): null {
    return null;
  }
}

/**
 * Auth for request coming from the lab if the request is made from the lab using a token
 */
export class CnAuthContextHierarchyObjectToken extends CnAuthContextBase {
  type = 'hierarchyObjectToken' as const;

  constructor(
    public space: CnSpace,
    public hierarchyObject: CnHierarchyObject,
    public accessToken: string
  ) {
    super();
  }

  getUser(): null {
    return null;
  }

  getSpace(): CnSpace {
    return this.space;
  }

  getRoleInSpace(): null {
    return null;
  }

  getLab(): null {
    return null;
  }
}

export type CnAuthContext =
  | CnAuthContextUser
  | CnAuthContextUserNoSpace
  | CnAuthContextLab
  | CnAuthContextLabToken
  | CnAuthContextLabManager
  | CnAuthContextCron
  | CnAuthContextHierarchyObjectToken;
