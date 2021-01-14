/**
 * Error sent by the API and format by the FlApiService
 */

export interface NestError {
  statusCode: number;
  error: string;
  message?: string;
}
