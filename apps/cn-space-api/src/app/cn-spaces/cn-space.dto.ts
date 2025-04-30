import { CnSpaceUserRole } from './cn-space-user.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnSpaceInvit } from './cn-space-invit.entity';
import { CnSpaceEntity } from './cn-space.entity';
import { Type } from 'class-transformer';
import { CnBucketLocationDTO } from '../cn-object-storages/cn-buckets/cn-bucket.entity';

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
  @Type(() => CnSpaceEntity)
  space: CnSpaceEntity;

  defaultFolderStorageLocation: CnBucketLocationDTO;
  defaultFolderBackupStorageLocation?: CnBucketLocationDTO;

  static fromSpace(space: CnSpaceEntity): CnSpaceSettingsDto {
    const spaceSettings = new CnSpaceSettingsDto();
    spaceSettings.space = space;
    spaceSettings.defaultFolderStorageLocation = space.defaultFolderBucket.getBucketLocation();
    spaceSettings.defaultFolderBackupStorageLocation =
      space.defaultFolderBackupBucket?.getBucketLocation() ?? null;

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
  defaultFolderStorageLocation: CnBucketLocationDTO;
  defaultFolderBackupStorageLocation?: CnBucketLocationDTO;
}

export class CnSpaceStorage {
  cloudStorageLimit: number;
  cloudStorageUsage: number;

  defaultFolderStorageLocation: CnBucketLocationDTO;
  defaultBackupFolderStorageLocation?: CnBucketLocationDTO;

  constructor(
    cloudStorageLimit: number,
    cloudStorageUsage: number,
    defaultFolderStorageLocation: CnBucketLocationDTO,
    defaultBackupFolderStorageLocation?: CnBucketLocationDTO
  ) {
    this.cloudStorageLimit = cloudStorageLimit;
    this.cloudStorageUsage = cloudStorageUsage;
    this.defaultFolderStorageLocation = defaultFolderStorageLocation;
    this.defaultBackupFolderStorageLocation = defaultBackupFolderStorageLocation;
  }
}
