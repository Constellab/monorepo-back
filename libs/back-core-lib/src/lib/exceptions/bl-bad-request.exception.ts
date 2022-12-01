import {HttpStatus} from '@nestjs/common';
import {BlExceptionOptions, BlHttpException} from './bl-http.exception';


/**
 * Basic BadRequest Exception that support translation
 */
export class BlBadRequestException extends BlHttpException {

  /**
   * Basic BadRequest Exception that support translation
   * @param message the message will be translated if possible
   * @param options
   */
  constructor(message: string, options: BlExceptionOptions = {}) {
    super(HttpStatus.BAD_REQUEST, message, options);
  }
}

