import {BlEntityWithIdDTO} from '@monorepo/back-core-lib';
import {HnUserDto} from '../../users/hn-user.dto';
import {HnBrickUser} from './hn-brick-user.entity';

export class HnBrickUserDto extends BlEntityWithIdDTO {
  user: HnUserDto;

  constructor(brickUser: HnBrickUser) {
    super();
    this.id = brickUser.id;
    this.user = new HnUserDto(brickUser.user);
  }
}
