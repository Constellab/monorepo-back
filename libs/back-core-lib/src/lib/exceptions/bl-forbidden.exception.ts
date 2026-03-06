import { HttpStatus } from '@nestjs/common';

import { BlExceptionOptions, BlHttpException } from './bl-http.exception';

/**
 * Basic Forbidden Exception that support translation
 */
export class BlForbiddenException extends BlHttpException {
  /**
   * Basic Forbidden Exception that support translation
   * @param message the message will be translated if possible
   * @param options
   */
  constructor(message: string, options: BlExceptionOptions = {}) {
    super(HttpStatus.FORBIDDEN, message, options);
  }
}
