import {BlEntityWithIdDTO} from '@monorepo/back-core-lib';
import {HnBrickDto} from '../brick/hn-brick.dto';
import {HnUserDto} from '../../users/hn-user.dto';
import {HnBrickUser} from './hn-brick-user.entity';

export class HnBrickUserDto extends BlEntityWithIdDTO {
  brick: HnBrickDto;
  user: HnUserDto;

  constructor(brickUser: HnBrickUser) {
    super();
    this.id = brickUser.id;
    this.brick = new HnBrickDto(brickUser.brick);
    this.user = new HnUserDto(brickUser.user);
  }
}
