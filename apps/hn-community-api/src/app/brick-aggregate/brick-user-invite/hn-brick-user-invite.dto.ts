import { HnBaseDto } from '../../core/model/entities/hn-base.dto';
import { HnInviteStatus } from '../../core/model/config/hn-invite-status.enum';
import { HnBrickDto } from '../brick/hn-brick.dto';
import { HnBrickUserInvite } from './hn-brick-user-invite.entity';

export class HnBrickUserInviteDto extends HnBaseDto {
  email: string;
  status: HnInviteStatus;
  brick: HnBrickDto;
  token: string;

  constructor(obj: HnBrickUserInvite) {
    super(obj);
    this.email = obj.email;
    this.status = obj.status;
    this.brick = new HnBrickDto(obj.brick);
    this.token = obj.token;
  }
}
