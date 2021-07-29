import {HttpStatus} from '@nestjs/common';

/**
 * Format of the nest response error
 */
export interface CmNestApiError {
  // http status
  status: HttpStatus;

  // unique error code
  code: string;

  // unique id of this error instance
  detail?: string;

  // unique id of this error instance
  instanceId: string;
}
