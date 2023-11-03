import {CnSpaceUserRole} from './cn-space-user.entity';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnSpaceInvit} from './cn-space-invit.entity';
import {CnSpace} from './cn-space.entity';
import {Type} from 'class-transformer';
import {CnBucketLocationDTO} from '../cn-object-storages/cn-buckets/cn-bucket.entity';


export class CnSaveSpaceDTO {
  id: string;
  name: string;
  nbLicenses: number;

  defaultProjectStorageLocation: CnBucketLocationDTO;
  defaultProjectBackupStorageLocation?: CnBucketLocationDTO;
}

export interface CnSpaceInvitCreateDto {
  userMail: string;
  role: CnSpaceUserRole;
}


export interface CnRequestNewLicensesDto {
  nbLicenses: number;
  text?: string;
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

  defaultProjectStorageLocation: CnBucketLocationDTO;
  defaultBackupProjectStorageLocation ?: CnBucketLocationDTO;

  static fromSpace(space: CnSpace): CnSpaceSettingsDto {
    const spaceSettings = new CnSpaceSettingsDto();
    spaceSettings.space = space;
    spaceSettings.nbLicenses = space.nbLicenses;
    spaceSettings.defaultProjectStorageLocation = space.defaultProjectBucket.getBucketLocation();

    spaceSettings.defaultBackupProjectStorageLocation = space.defaultProjectBackupBucket?.getBucketLocation() ?? null;
    return spaceSettings;
  }
}
