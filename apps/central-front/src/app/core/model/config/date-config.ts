/**
 * Default format to use to the MatDataPicker
 *
 * See https://material.angular.io/components/datepicker/overview#internationalization
 *
 * See https://momentjs.com/docs/#/parsing/string-format/ form formats
 */
import {MatDateFormats} from '@angular/material/core';

export const matDateFormats: MatDateFormats = {
  parse: {
    // input supported by the date picker (like 04/09/1986 in local format)
    dateInput: ['L'],
  },
  display: {
    // displayed input value
    dateInput: 'L',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};
