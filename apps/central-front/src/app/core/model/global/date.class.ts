import * as momentImported from 'moment';
import {MomentInput} from 'moment';

/**
 * Export to use moment
 */
export const moment = momentImported;

/**
 * Input for {@HelperService} function that support date input. It uses MomentInput
 *
 * Moment format
 * Date (native js) format
 * Number time of the date
 * String
 */
export type DateInput = MomentInput;



