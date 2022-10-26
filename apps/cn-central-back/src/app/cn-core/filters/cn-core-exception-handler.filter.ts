import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {CnCoreConfigService} from '../modules/cn-core-config/cn-core-config.service';
import {QueryFailedError} from 'typeorm';
import {CnErrorText} from '../model/config/cn-error-text.class';
import {Request, Response} from 'express';
import {ClStringHelper} from '@monorepo/core-lib';
import {CmNestApiError} from '@monorepo/common-model';
import {CnCurrentUserHelper} from '../utils/cn-current-user.helper';
import {BlTranslateOptions, BlTranslateService} from '@monorepo/back-core-lib';


/**
 * Class to catch all exception and translate it if possible
 */
@Catch()
export class CnCoreExceptionHandlerFilter implements ExceptionFilter {

  private readonly logger = new Logger(CnCoreExceptionHandlerFilter.name);

  constructor(protected coreConfigService: CnCoreConfigService,
              private readonly translateService: BlTranslateService) {
  }

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const response: Response = host.switchToHttp().getResponse();
    try {
      const error: CmNestApiError = await this.handleError(exception as any);

      response.status(error.status).json(error);
    } catch (e) {
      const instanceId: string = ClStringHelper.generateUUID();
      // use catch error if an error is raised in handleError method
      // because it would break the app
      this.logger.error('Unexpected error thrown in CustomExceptionHandlerFilter | InstanceId ' + instanceId);
      const error: CmNestApiError = {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        detail: 'Server error',
        code: 'error.server_error',
        instanceId: instanceId
      };
      response.status(error.status).json(error);
    }
  }


  private async handleError(error: Error): Promise<CmNestApiError> {
    if (error instanceof HttpException) {

      // translate the error message and throw the exception with error code and message
      return this.convertToNestError(error.message, error.getStatus());
    } else if (error instanceof QueryFailedError && (error as any).code === 'ER_DATA_TOO_LONG') {
      return this.handleDataTooLongError(error);
    }

    const instanceId: string = ClStringHelper.generateUUID();

    // log the error
    this.logError(error, instanceId);


    // in prod env, send a server error exception to hide detail for the user
    if (this.coreConfigService.isProduction()) {
      // translate the error message and throw the exception with error code and message
      return this.convertToNestError(CnErrorText.SERVER_ERROR, HttpStatus.BAD_REQUEST);
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        code: CnErrorText.SERVER_ERROR,
        detail: error.message,
        instanceId: instanceId
      };
    }
  }

  // method to log the error in the console with context info
  private logError(error: Error, instanceId: string): void {
    const request: Request = CnCurrentUserHelper.getCurrentRequest();
    const userString = CnCurrentUserHelper.getCurrentUser()?.getUserInfo() ?? 'No user';
    const organizationString = CnCurrentUserHelper.getCurrentOrganization()?.id ?? 'No organization';
    // eslint-disable-next-line max-len
    this.logger.error(`Error during request ${request.url} | Method ${request.method} | User : ${userString} | Organization : ${organizationString} | InstanceId ${instanceId}`);
    this.logger.error(error.stack);
  }

  // handle ER_DATA_TOO_LONG error when inserting in DB
  private handleDataTooLongError(error: QueryFailedError): Promise<CmNestApiError> {
    // split message on ' character
    // example of message: ER_DATA_TOO_LONG: Data too long for column 'title' at row 1
    const splitMessage: string[] = error.message.split('\'');
    let fieldName: string = '';
    if (splitMessage?.length > 1) {
      // get the text between '
      fieldName = splitMessage[1];
    }

    return this.convertToNestError(CnErrorText.COLUMN_TOO_LONG,
      HttpStatus.BAD_REQUEST, {args: {field: fieldName}});
  }

  /**
   * Translate the message and return an error observable with status
   */
  private async convertToNestError(errorCode: string, status: HttpStatus, options: BlTranslateOptions = {}): Promise<CmNestApiError> {
    // translate the error message and throw the exception with error code and message
    const translatedMessage: string = await this.translateService.translate(errorCode, options);

    return {
      status: status,
      code: errorCode,
      detail: translatedMessage,
      instanceId: ClStringHelper.generateUUID()
    };
  }

}
