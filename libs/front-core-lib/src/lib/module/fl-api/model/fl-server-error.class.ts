import {HttpErrorResponse} from '@angular/common/http';

export interface FlServerError {
  response?: HttpErrorResponse;
  logDetail: FlLogDetail;
}

export interface FlLogDetail {
  timestamp: Date;
  message: string;
}
