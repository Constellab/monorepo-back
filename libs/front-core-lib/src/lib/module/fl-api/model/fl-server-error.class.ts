import {HttpErrorResponse} from '@angular/common/http';
import {CmApiError} from '@monorepo/common-model';

export interface FlServerError {
  response?: HttpErrorResponse;
  message: string;
  nestedError?: CmApiError;
}
