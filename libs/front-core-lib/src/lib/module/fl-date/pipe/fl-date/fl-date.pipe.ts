import {Pipe, PipeTransform} from '@angular/core';
import {ClDateHelper, ClDateInput} from '@monorepo/core-lib';
import {DateTime, DateTimeFormatOptions} from 'luxon';

export type FlDatePipeFormat =
  string | FlDatePipeLocalFormatPreset;

type FlDatePipeLocalFormatPreset =
  | 'DATE_SHORT'
  | 'DATE_MED'
  | 'DATE_MED_WITH_WEEKDAY'
  | 'DATE_FULL'
  | 'DATE_HUGE'
  | 'TIME_SIMPLE'
  | 'TIME_WITH_SECONDS'
  | 'TIME_WITH_SHORT_OFFSET'
  | 'TIME_WITH_LONG_OFFSET'
  | 'TIME_24_SIMPLE'
  | 'TIME_24_WITH_SECONDS'
  | 'TIME_24_WITH_SHORT_OFFSET'
  | 'TIME_24_WITH_LONG_OFFSET'
  | 'DATETIME_SHORT'
  | 'DATETIME_SHORT_WITH_SECONDS'
  | 'DATETIME_MED'
  | 'DATETIME_MED_WITH_SECONDS'
  | 'DATETIME_MED_WITH_WEEKDAY'
  | 'DATETIME_FULL'
  | 'DATETIME_FULL_WITH_SECONDS'
  | 'DATETIME_HUGE'
  | 'DATETIME_HUGE_WITH_SECONDS';

const flDatePipeLocalFormatPreset: { [key in FlDatePipeLocalFormatPreset]: DateTimeFormatOptions } = {
  'DATE_SHORT': DateTime.DATE_SHORT,
  'DATE_MED': DateTime.DATE_MED,
  'DATE_MED_WITH_WEEKDAY': DateTime.DATE_MED_WITH_WEEKDAY,
  'DATE_FULL': DateTime.DATE_FULL,
  'DATE_HUGE': DateTime.DATE_HUGE,
  'TIME_SIMPLE': DateTime.TIME_SIMPLE,
  'TIME_WITH_SECONDS': DateTime.TIME_WITH_SECONDS,
  'TIME_WITH_SHORT_OFFSET': DateTime.TIME_WITH_SHORT_OFFSET,
  'TIME_WITH_LONG_OFFSET': DateTime.TIME_WITH_LONG_OFFSET,
  'TIME_24_SIMPLE': DateTime.TIME_24_SIMPLE,
  'TIME_24_WITH_SECONDS': DateTime.TIME_24_WITH_SECONDS,
  'TIME_24_WITH_SHORT_OFFSET': DateTime.TIME_24_WITH_SHORT_OFFSET,
  'TIME_24_WITH_LONG_OFFSET': DateTime.TIME_24_WITH_LONG_OFFSET,
  'DATETIME_SHORT': DateTime.DATETIME_SHORT,
  'DATETIME_SHORT_WITH_SECONDS': DateTime.DATETIME_SHORT_WITH_SECONDS,
  'DATETIME_MED': DateTime.DATETIME_MED,
  'DATETIME_MED_WITH_SECONDS': DateTime.DATETIME_MED_WITH_SECONDS,
  'DATETIME_MED_WITH_WEEKDAY': DateTime.DATETIME_MED_WITH_WEEKDAY,
  'DATETIME_FULL': DateTime.DATETIME_FULL,
  'DATETIME_FULL_WITH_SECONDS': DateTime.DATETIME_FULL_WITH_SECONDS,
  'DATETIME_HUGE': DateTime.DATETIME_HUGE,
  'DATETIME_HUGE_WITH_SECONDS': DateTime.DATETIME_HUGE_WITH_SECONDS
};

/**
 * Simple date pipe that supports luxon dates
 * Supports : https://moment.github.io/luxon/#/formatting?id=table-of-tokens
 * Support preset : https://moment.github.io/luxon/#/formatting?id=presets
 */
@Pipe({
  name: 'flDate'
})
export class FlDatePipe implements PipeTransform {

  transform(value: ClDateInput, format: FlDatePipeFormat = 'D'): string {
    if (value == null) {
      return '';
    }

    const date = ClDateHelper.getDate(value);

    const localDateOption = flDatePipeLocalFormatPreset[format];

    // if the string matched a local format preset, use it
    if (localDateOption) {
      return date.toLocaleString(localDateOption);
    } else {
      return date.toFormat(format);
    }
  }

}
