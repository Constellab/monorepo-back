import {CnSpaceUserRole} from './cn-space-user.entity';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnSpaceInvit} from './cn-space-invit.entity';
import {CnSpace} from './cn-space.entity';
import {Type} from 'class-transformer';
import {CnBucketLocationDTO} from '../cn-object-storages/cn-buckets/cn-bucket.entity';


export class CnCreateSpaceDTO {
  name: string;
  defaultStorageLocations: CnSpaceUpdateStorageLocationDTO;
}

export interface CnSpaceInvitCreateDto {
  userMail: string;
  role: CnSpaceUserRole;
}

export interface CnSpaceInvitReadDto {

  invitation: CnSpaceInvit;

  // provided if the email in the invitation corresponds to an existing user
  existingUser?: CnUser;
}


export class CnSpaceSettingsDto {
  @Type(() => CnSpace)
  space: CnSpace;
  nbLicenses: number;

  static fromSpace(space: CnSpace): CnSpaceSettingsDto {
    const spaceSettings = new CnSpaceSettingsDto();
    spaceSettings.space = space;
    spaceSettings.nbLicenses = space.nbLicenses;

    return spaceSettings;
  }
}

/////////////////////////////////// LICENSE //////////////////////////////////////
export interface CnRequestNewLicensesDto {
  nbLicenses: number;
  text?: string;
}

/////////////////////////////////// STORAGE //////////////////////////////////////
export class CnSpaceUpdateStorageLocationDTO {
  defaultProjectStorageLocation: CnBucketLocationDTO;
  defaultProjectBackupStorageLocation?: CnBucketLocationDTO;
}

export class CnSpaceStorage {
  storageLimit: number;
  storageUsage: number;

  defaultProjectStorageLocation: CnBucketLocationDTO;
  defaultBackupProjectStorageLocation ?: CnBucketLocationDTO;

  constructor(storageLimit: number, storageUsage: number,
              defaultProjectStorageLocation: CnBucketLocationDTO,
              defaultBackupProjectStorageLocation?: CnBucketLocationDTO) {
    this.storageLimit = storageLimit;
    this.storageUsage = storageUsage;
    this.defaultProjectStorageLocation = defaultProjectStorageLocation;
    this.defaultBackupProjectStorageLocation = defaultBackupProjectStorageLocation;
  }
}
