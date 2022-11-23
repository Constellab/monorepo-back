import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUser} from '../../cn-users/cn-user.entity';


/**
 * Basic security that allow only G admin to modify entities and all users to read entities
 */
@Injectable()
export class CnConfigEntitySecurity {


  public async checkAuthorizationToModifyEntity(user: CnUser): Promise<void> {
    if (!user.isAdmin()) throw new UnauthorizedException();
  }

  public async checkAuthorizationToReadEntity(): Promise<void> {
    return;
  }
}
