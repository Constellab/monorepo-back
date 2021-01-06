/**
 * Input for {@HelperService} function that support date input. It uses DateInput
 *
 * DateTime format
 * Date (native js) format
 * Number time (millisecond) of the date
 * String
 */
import {DateTime} from 'luxon';

export type DateInput = string | number | Date | DateTime;



