import {HttpException} from '@nestjs/common';

export interface BlExceptionOptions {
  /**
   * Parameter for the error message
   */
  detailArgs?: Record<string, any>;

  /**
   * Instance id to recognize this error if it was generated from another error
   */
  instanceId?: string;
}

export class BlHttpException extends HttpException {

  /**
   * Basic http exception that support translation
   * @param status
   * @param message the message will be translated if possible
   * @param options
   */
  constructor(status: number, message: string,
              public options: BlExceptionOptions = {}) {
    super(message, status);
  }
}
