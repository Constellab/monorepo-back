import {CnUser} from '../cn-users/cn-user.entity';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {CnServerInfo} from '../cn-servers-info/cn-server-info.entity';
import {BlBaseEntityDto, BlDtoHelper} from '@monorepo/back-core-lib';
import {CnBrickVersionDTO} from '../cn-bricks/cn-brick.dto';
import {CnLabConfigDto} from '../cn-lab-configs/cn-lab-config.dto';
import {CnSpace} from '../cn-spaces/cn-space.entity';
import {Type} from 'class-transformer';
import {CnLabInstanceUserRole} from './user/cn-lab-instance-user.entity';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';


/**
 * DTO for the users that have access to a lab instance
 */
export class CnLabInstanceDto extends BlBaseEntityDto {
  name: string = undefined;
  lab: CnLabConfig = undefined;
  owner: CnUser = undefined;
  currentStatus: CnLabInstanceStatusHistory = undefined;
  virtualHost: string = undefined;
  apiUrl: string = undefined;
  codelabToken: string = undefined;
  frontUrl: string = undefined;
  serverInfo: CnServerInfo = undefined;
  region: CnCloudProviderRegion = undefined;
  space: CnSpace = undefined;
}

/**
 * DTO for the lab instance only for G admin
 */
export class CnLabInstanceAdminDto extends CnLabInstanceDto {
  glabApiKey: string = undefined;
  labManagerApiKey: string = undefined;
}

export class CnLabFindOneDto {
  @Type(() => CnLabInstanceDto)
  labInstance: CnLabInstanceDto = undefined;

  userRole: CnLabInstanceUserRole;

  static create(labInstance: CnLabInstance, userRole: CnLabInstanceUserRole): CnLabFindOneDto {
    const dto = new CnLabFindOneDto();
    dto.labInstance = BlDtoHelper.toDto(CnLabInstanceDto, labInstance);
    dto.userRole = userRole;
    return dto;
  }
}


export interface CnLabInstanceConfigDTO {
  brickVersions: CnBrickVersionDTO[];
  glabTag: 'latest' | 'beta' | string;
}


export interface CnLabInstanceStartDTO {
  lab_config: CnLabConfigDto;
}

export class CnLabInstanceCreateDTO {
  id: string;
  name: string;
  virtualHost: string;

  @Type(() => CnServerInfo)
  serverInfo: CnServerInfo;

  // mandatory in create, empty in update
  @Type(() => CnUser)
  owner?: CnUser;

  glabApiKey: string;
  labManagerApiKey: string;
  codelabToken: string;

  @Type(() => CnCloudProviderRegion)
  region: CnCloudProviderRegion;

  @Type(() => CnSpace)
  space: CnSpace;
}

