import {CmApiError} from '@monorepo/common-model';

/**
 * Error returned by the lab api
 */
export interface LabApiError extends CmApiError{
  show_as: 'error' | 'info';
}
