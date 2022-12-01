import {HttpStatus} from '@nestjs/common';
import {BlExceptionOptions, BlHttpException} from './bl-http.exception';


/**
 * Basic Unauthorized Exception that support translation
 */
export class BlUnauthorizedException extends BlHttpException {

  /**
   * Basic Unauthorized Exception that support translation
   * @param message the message will be translated if possible
   * @param options
   */
  constructor(message: string = 'error.unauthorized', options: BlExceptionOptions = {}) {
    super(HttpStatus.UNAUTHORIZED, message, options);
  }
}

