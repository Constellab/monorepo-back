import {CnSpaceUserRole} from './cn-space-user.entity';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnSpaceInvit} from './cn-space-invit.entity';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnSpace} from './cn-space.entity';
import {Type} from 'class-transformer';


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
  @Type(() => CnCloudProviderRegion)
  defaultStorageRegion: CnCloudProviderRegion;
  @Type(() => CnCloudProviderRegion)
  defaultBackupStorageRegion: CnCloudProviderRegion;

  static fromSpace(space: CnSpace): CnSpaceSettingsDto {
    const spaceSettings = new CnSpaceSettingsDto();
    spaceSettings.space = space;
    spaceSettings.nbLicenses = space.nbLicenses;
    spaceSettings.defaultStorageRegion = space.defaultStorageRegion;
    spaceSettings.defaultBackupStorageRegion = space.defaultBackupStorageRegion;
    return spaceSettings;
  }
}
