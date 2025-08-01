import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';

import { HnUserDto } from '../../users/hn-user.dto';
import { HnCommunityAppUser } from './hn-community-app-user.entity';

export class HnCommunityAppUserDto extends BlEntityWithIdDTO {
  user: HnUserDto;

  constructor(appUser: HnCommunityAppUser) {
    super();
    this.id = appUser.id;
    this.user = new HnUserDto(appUser.user);
  }
}
