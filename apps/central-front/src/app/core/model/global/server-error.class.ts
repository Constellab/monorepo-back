/**
 * Error sent by the API and format by the ApiService
 */
import {HttpErrorResponse} from '@angular/common/http';

export interface ServerError {
  response?: HttpErrorResponse;
  logDetail: LogDetail;
}

export interface LogDetail {
  timestamp: Date;
  message: string;
}

export interface NestError {
  statusCode: number;
  error: string;
  message?: string;
}
