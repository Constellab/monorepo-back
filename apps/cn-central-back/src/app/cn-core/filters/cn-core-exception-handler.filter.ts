import {Catch, Logger} from '@nestjs/common';
import {CnCoreConfigService} from '../modules/cn-core-config/cn-core-config.service';
import {CnErrorText} from '../model/config/cn-error-text.class';
import {Request} from 'express';
import {CnCurrentUserHelper} from '../utils/cn-current-user.helper';
import {BlCoreExceptionHandlerFilter, BlTranslateService} from '@monorepo/back-core-lib';


/**
 * Class to catch all exception and translate it if possible
 */
@Catch()
export class CnCoreExceptionHandlerFilter extends BlCoreExceptionHandlerFilter {

  protected readonly logger = new Logger(CnCoreExceptionHandlerFilter.name);

  constructor(coreConfigService: CnCoreConfigService,
              translateService: BlTranslateService) {
    super(translateService, {
      isProduction: coreConfigService.isProduction(),
      errorColumnToLong: CnErrorText.COLUMN_TOO_LONG,
      serverError: CnErrorText.SERVER_ERROR
    });
  }


  protected logUnknownError(error: Error, instanceId: string): void {
    const request: Request = CnCurrentUserHelper.getCurrentRequest();
    const userString = CnCurrentUserHelper.getCurrentUser()?.getUserInfo() ?? 'No user';
    const spaceString = CnCurrentUserHelper.getCurrentSpace()?.id ?? 'No space';
    // eslint-disable-next-line max-len
    this.logger.error(`Error during request ${request.url} | Method ${request.method} | User : ${userString} | Space : ${spaceString} | InstanceId ${instanceId}`);
    this.logger.error(error.stack);
  }

}
