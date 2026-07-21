/**
 * Format of the nest response error
 */
export interface BlApiError {
  // http status
  status: number;

  // unique error code
  code: string;

  // error message detail
  detail?: string;

  // unique id of this error instance
  instanceId: string;
}
