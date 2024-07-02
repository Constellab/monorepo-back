import {BlEntityWithIdDTO} from '@monorepo/back-core-lib';
import {CnBrickVisibility} from '../../cn-bricks/cn-brick.entity';
import {CnCommunityUserDto} from './cn-community-user.dto';
import {CnCommunitySpaceDto} from './cn-community-space.dto';

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
  createdBy: CnCommunityUserDto;
  lastModifiedAt: string;
  lastModifiedBy: CnCommunityUserDto;
  space?: CnCommunitySpaceDto;
  likes: number;
  comments: number;
}
