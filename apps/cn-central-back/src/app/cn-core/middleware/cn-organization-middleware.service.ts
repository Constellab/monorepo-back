import {Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import {CnOrganizationsService} from '../../cn-organizations/cn-organizations.service';
import {CnCoreConfigService} from '../modules/cn-core-config/cn-core-config.service';
import {CnRequestAuthInfo} from '../utils/cn-current-user.helper';
import {ClStringHelper} from '@monorepo/core-lib';

export const CN_LOCAL_ORGANIZATION_HEADER = 'local-organization';

/**
 * Middleware to retrieve the organization from the request and add it to the request
 * In production, the organization is retrieved from the domain name
 * In local, the organization is retrieved from the request header
 */
@Injectable()
export class CnOrganizationMiddleware implements NestMiddleware<Request, Response> {

  constructor(private organizationService: CnOrganizationsService,
              private configService: CnCoreConfigService) {
  }

  use(req: Request, res: Response, next: NextFunction): void {
    let organizationDomain: string;
    if(this.configService.isLocal()){
      organizationDomain = req.header(CN_LOCAL_ORGANIZATION_HEADER);
    }else{
      const origin = req.header('origin');
      organizationDomain = ClStringHelper.getLowestDomainFromUrl(origin);
      console.log('origin', origin, 'organizationDomain', organizationDomain);
    }

    if(organizationDomain == null){
      next();
    }else{
      // retrieve the organization and store it in the request if found
      this.organizationService.findByDomain(organizationDomain).then(organization => {
        if(organization){
          // noinspection UnnecessaryLocalVariableJS
          const authInfo: CnRequestAuthInfo = {organization: organization};
          req.authInfo = authInfo;
        }
        next();
        // TODO check what to do if organization not found
      }).catch(() => next());
    }
  }
}
