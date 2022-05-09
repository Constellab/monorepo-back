/**
 * Error returned by the lab api
 */
export interface LabApiError {
  // unique error code
  code: string;

  // http status
  status: number;

  // message of the error
  detail: string;

  // unique id of this error instance
  instance_id: string;

  show_as: 'error' | 'info';
}
