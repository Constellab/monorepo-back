import {HttpErrorResponse} from '@angular/common/http';
import {CmNestApiError} from '@monorepo/common-model';

export interface FlServerError {
  response?: HttpErrorResponse;
  message: string;
  nestedError?: CmNestApiError;
}
