import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {CoreConfigService} from '../modules/core-config/core-config.service';
import {TranslateService} from '../modules/translate/translate.service';
import {QueryFailedError} from 'typeorm';
import {ErrorText} from '../model/config/error-text.class';
import {Request, Response} from 'express';
import {RequestContextHelper} from '../modules/request-context/request-context.helper';
import {TranslateOptions} from '../modules/translate/translate-options.class';

/**
 * Format of the response Error
 */
interface ResponseError {
  statusCode: HttpStatus;
  error: string;
  message?: string;
}

/**
 * Class to catch all exception and translate it if possible
 */
@Catch()
export class CustomExceptionHandlerFilter implements ExceptionFilter {

  private readonly logger = new Logger(CustomExceptionHandlerFilter.name);

  constructor(protected coreConfigService: CoreConfigService,
              private readonly translateService: TranslateService) {
  }

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const response: Response = host.switchToHttp().getResponse();
    try {
      const error: ResponseError = await this.handleError(exception as any);

      response.status(error.statusCode).json(error);
    } catch (e) {
      // use catch error if an error is raised in handleError method
      // because it would break the app
      this.logger.error('Unexpected error thrown in CustomExceptionHandlerFilter');
      const error: ResponseError = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Server error',
        error: 'server_error'
      };
      response.status(error.statusCode).json(error);
    }
  }


  private async handleError(error: Error): Promise<ResponseError> {
    if (error instanceof HttpException) {

      // translate the error message and throw the exception with error code and message
      return this.convertToNestError(error.message, error.getStatus());
    } else if (error instanceof QueryFailedError && (error as any).code === 'ER_DATA_TOO_LONG') {
      return this.handleDataTooLongError(error);
    }

    // log the error
    this.logError(error);


    // in prod env, send a server error exception to hide detail for the user
    if (this.coreConfigService.isProduction()) {
      // translate the error message and throw the exception with error code and message
      return this.convertToNestError(ErrorText.SERVER_ERROR, HttpStatus.BAD_REQUEST);
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        error: error.stack
      };
    }
  }

  // method to log the error in the console with context info
  private logError(error: Error): void {
    const request: Request = RequestContextHelper.getCurrentRequest();
    const userString = RequestContextHelper.getCurrentUser()?.getUserInfo() ?? 'No user';
    this.logger.error(`Error during request ${request.url} | Method ${request.method} | User : ${userString}`);
    this.logger.error(error.stack);
  }

  // handle ER_DATA_TOO_LONG error when inserting in DB
  private handleDataTooLongError(error: QueryFailedError): Promise<ResponseError> {
    // split message on ' character
    // example of message: ER_DATA_TOO_LONG: Data too long for column 'title' at row 1
    const splitMessage: string[] = error.message.split('\'');
    let fieldName: string = '';
    if (splitMessage?.length > 1) {
      // get the text between '
      fieldName = splitMessage[1];
    }

    return this.convertToNestError(ErrorText.COLUMN_TOO_LONG,
      HttpStatus.BAD_REQUEST, {args: {field: fieldName}});
  }

  /**
   * Translate the message and return an error observable with status
   */
  private async convertToNestError(errorCode: string, status: HttpStatus, options: TranslateOptions = {}): Promise<ResponseError> {
    // translate the error message and throw the exception with error code and message
    const translatedMessage: string = await this.translateService.translate(errorCode, options);

    return {
      statusCode: status,
      message: translatedMessage,
      error: errorCode
    };
  }

}
