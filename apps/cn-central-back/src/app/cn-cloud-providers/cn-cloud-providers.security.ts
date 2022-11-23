import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUser} from '../cn-users/cn-user.entity';


@Injectable()
export class CnCloudProvidersSecurity {


  public async checkAuthorizationToModifyEntity(user: CnUser): Promise<void> {
    if (!user.isAdmin()) throw new UnauthorizedException();
  }

  public async checkAuthorizationToReadEntity(): Promise<void> {
    return;
  }
}
