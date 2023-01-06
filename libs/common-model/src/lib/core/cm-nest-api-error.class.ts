/**
 * Format of the nest response error
 */
export interface CmApiError {
  // http status
  status: number;

  // unique error code
  code: string;

  // unique id of this error instance
  detail?: string;

  // unique id of this error instance
  instanceId: string;
}
