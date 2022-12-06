import {Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import {CnSpaceService} from '../../cn-spaces/cn-space.service';
import {CnCoreConfigService} from '../modules/cn-core-config/cn-core-config.service';
import {CnCurrentUserHelper} from '../utils/cn-current-user.helper';
import {ClStringHelper} from '@monorepo/core-lib';
import {BlCookieHelper} from '@monorepo/back-core-lib';

export const CN_LOCAL_SPACE_COOKIE = 'local-space';

/**
 * Middleware to retrieve the space from the request and add it to the request
 * In production, the space is retrieved from the domain name
 * In local, the space is retrieved from the request header
 */
@Injectable()
export class CnSpaceMiddleware implements NestMiddleware<Request, Response> {
  constructor(private spaceService: CnSpaceService,
              private configService: CnCoreConfigService) {
  }

  use(req: Request, res: Response, next: NextFunction): void {
    let spaceDomain: string;
    if (this.configService.isLocal()) {
      spaceDomain = BlCookieHelper.getCookieFromHeader(req.headers.cookie, CN_LOCAL_SPACE_COOKIE)
    } else {
      const origin = req.header('origin') ?? req.header('referer');
      spaceDomain = ClStringHelper.getLowestDomainFromUrl(origin);
    }

    if (spaceDomain == null) {
      next();
    } else {
      // retrieve the space and store it in the request if found
      this.spaceService.findByDomain(spaceDomain).then(space => {
        if (space) {
          CnCurrentUserHelper.setCurrentSpace(space);
        }
        next();
        // TODO check what to do if space not found
      }).catch(() => next());
    }
  }
}
