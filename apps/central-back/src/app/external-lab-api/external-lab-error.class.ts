/**
 * Format of the error returned by the labs
 */
export interface ExternalLabError {
  /**
   * Unique code of the error (can be used to understand response)
   */
  code: string;

  /**
   * HTTP error code
   */
  status: number;

  /**
   * Human readable message
   */
  detail: string;

  /**
   * Unique id of this error thrown
   */
  instance_id: string;
}
