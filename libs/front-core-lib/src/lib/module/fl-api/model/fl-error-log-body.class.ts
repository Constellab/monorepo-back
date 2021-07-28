/**
 * Format of the body when logging an error to the API
 */
export interface FlErrorLogBody{
  name: string;
  message: string;
  stackTrace: string;
  route: string;
}
