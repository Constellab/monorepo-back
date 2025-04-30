import { Catch, Logger } from '@nestjs/common';
import { HnCoreConfigService } from '../modules/core-config/hn-core-config.service';
import { Request } from 'express';
import { HnCurrentUserHelper } from '../utils/hn-current-user.helper';
import { BlCoreExceptionHandlerFilter, BlTranslateService } from '@monorepo/back-core-lib';
import { HnErrorText } from '../model/config/hn-error-text.class';

/**
 * Class to catch all exception and translate it if possible
 */
@Catch()
export class HnCoreExceptionHandlerFilter extends BlCoreExceptionHandlerFilter {
  protected readonly logger = new Logger(HnCoreExceptionHandlerFilter.name);

  constructor(coreConfigService: HnCoreConfigService, translateService: BlTranslateService) {
    super(translateService, {
      isProduction: coreConfigService.isProduction(),
      serverError: HnErrorText.SERVER_ERROR,
      errorColumnToLong: HnErrorText.COLUMN_TOO_LONG,
    });
  }

  // method to log the error in the console with context info
  protected logUnknownError(error: Error, instanceId: string): void {
    const request: Request = HnCurrentUserHelper.getCurrentRequest();
    const requestString = request
      ? `Error during request ${request.url} | Method ${request.method} | `
      : 'Error without request';
    const userString = HnCurrentUserHelper.getCurrentUser()?.getUserInfo() ?? 'No user';
    // eslint-disable-next-line max-len
    this.logger.error(
      `${requestString} | User : ${userString} | InstanceId ${instanceId} | Error : ${error.message}`
    );
    if (error.stack) {
      this.logger.error(error.stack);
    }
  }
}
