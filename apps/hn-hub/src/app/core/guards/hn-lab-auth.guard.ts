import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  BlExternalApiService,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { HnCoreConfigService } from '../modules/core-config/hn-core-config.service';
import { lastValueFrom } from 'rxjs';
import { HnUserService } from '../../users/hn-user.service';
import { HnCurrentUserHelper } from '../utils/hn-current-user.helper';

@Injectable()
export class HnLabAuthGuard implements CanActivate {
  private readonly logger = new Logger(HnLabAuthGuard.name);

  constructor(
    private readonly blExternalApiService: BlExternalApiService,
    private readonly coreConfigService: HnCoreConfigService,
    private readonly userService: HnUserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.labAuthentication(context);
  }

  private async labAuthentication(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (
      request.header('user') == null ||
      request.header('authorization') == null
    ) {
      throw new BlUnauthorizedException();
    }
    const checkApiKeyUser: boolean = await lastValueFrom(
      this.blExternalApiService.get(
        this.coreConfigService.getCentralApiUrl() + 'external-labs/check-test',
        null,
        {
          headers: {
            user: request.header('user'),
            authorization: request.header('authorization'),
          },
        }
      )
    );
    if (checkApiKeyUser != true) {
      throw new BlUnauthorizedException();
    }

    const currentUser = await this.userService.findOne(request.header('user'));
    if (!currentUser) throw new BlUnauthorizedException();

    HnCurrentUserHelper.setLabInstanceCurrentUser(currentUser);

    return true;
  }
}
