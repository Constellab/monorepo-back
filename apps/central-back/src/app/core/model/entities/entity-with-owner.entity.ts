import {User} from '../../../users/user.entity';

export interface EntityWithOwner {
  getOwner(): User;
}
