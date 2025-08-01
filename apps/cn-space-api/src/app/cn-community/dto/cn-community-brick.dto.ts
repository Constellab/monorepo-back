import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';

import { CnBrickVisibility } from '../../cn-bricks/cn-brick.entity';
import { CnCommunitySpaceDto } from './cn-community-space.dto';
import { CnCommunityUserDto } from './cn-community-user.dto';

export class CnCommunityBrickDto extends BlEntityWithIdDTO {
  name: string;
  description: string;
  isCertified: boolean;
  visibility: CnBrickVisibility;
  pipRepo?: string;
  gitRepo?: string;
  imageLink?: string;
  credentialUsername?: string;
  credentialPassword?: string;
  createdAt: string;

  @Type(() => CnCommunityUserDto)
  createdBy: CnCommunityUserDto;
  lastModifiedAt: string;

  @Type(() => CnCommunityUserDto)
  lastModifiedBy: CnCommunityUserDto;

  @Type(() => CnCommunitySpaceDto)
  space?: CnCommunitySpaceDto;
  likes: number;
  comments: number;
}

export class CnCommunityBrickVersionDTO {
  brickName: string;
  brickVersion: string;
  repoType: 'PIP' | 'GIT';
  repositoryUrl: string;
  // url to access the repository with the token
  repositoryAccessUrl: string;
  technicalInfo?: Record<string, any>;
}
