import {CnUser} from '../../../cn-users/cn-user.entity';

export interface CnEntityWithOwner {
  getOwner(): CnUser;
}
