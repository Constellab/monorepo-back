import {Inject, Injectable, Optional} from '@angular/core';

import {DateTime, Info, Settings} from 'luxon';
/**
 * Default format to use to the MatDataPicker
 *
 * Code from https://gist.github.com/Zyzle/a9c5daa396882eb155282bcb454b9511
 *
 * See https://material.angular.io/components/datepicker/overview#internationalization
 *
 * See https://momentjs.com/docs/#/parsing/string-format/ form formats
 */
import {DateAdapter, MAT_DATE_LOCALE, MatDateFormats} from '@angular/material/core';

export const luxonDateFormat: MatDateFormats = {
  parse: {
    // input supported by the date picker (like 04/09/1986 in local format)
    dateInput: 'D',
  },
  display: {
    // displayed input value
    dateInput: 'D',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'DDD',
    monthYearA11yLabel: 'MMMM yyyy',
  }
};

/**
 * Creates an array and fills it with values.
 */
function range<T>(length: number, valueFunction: (index: number) => T): T[] {
  const valuesArray = Array(length);
  for (let i = 0; i < length; i++) {
    valuesArray[i] = valueFunction(i);
  }
  return valuesArray;
}

// TODO(mmalerba): Remove when we no longer support safari 9.
/** Whether the browser supports the Intl API. */
const SUPPORTS_INTL_API = typeof Intl !== 'undefined';

/** The default date names to use if Intl API is not available. */
const DEFAULT_DATE_NAMES = range(31, i => String(i + 1));

@Injectable({providedIn: 'root'})
export class LuxonDateAdapter extends DateAdapter<DateTime> {

  constructor(@Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string) {
    super();
    this.setLocale(matDateLocale);
  }

  setLocale(locale: any): void {
    super.setLocale(locale);
    Settings.defaultLocale = locale;
  }

  getYear(date: DateTime): number {
    return date.year;
  }

  getMonth(date: DateTime): number {
    // The Datepicker uses this to index into the 0 indexed
    // getMonthNames array so far as I can tell. Because Luxon uses
    // 1-12 for months we need to subtract one.
    return date.month - 1;
  }

  getDate(date: DateTime): number {
    return date.day;
  }

  getDayOfWeek(date: DateTime): number {
    return date.weekday;
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    return Info.months(style);
  }

  getDateNames(): string[] {
    if (SUPPORTS_INTL_API) {
      const dtf = new Intl.DateTimeFormat(this.locale, {day: 'numeric'});
      return range(31, i => this._stripDirectionalityCharacters(
        dtf.format(new Date(2017, 0, i + 1))));
    }
    return DEFAULT_DATE_NAMES;
  }


  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    return Info.weekdays(style);
  }

  getYearName(date: DateTime): string {
    if (SUPPORTS_INTL_API) {
      const dtf = new Intl.DateTimeFormat(this.locale, {year: 'numeric'});
      const valueOfDate = date.valueOf();
      return this._stripDirectionalityCharacters(dtf.format(valueOfDate));
    }
    return String(this.getYear(date));
  }

  getFirstDayOfWeek(): number {
    return 0;
  }

  getNumDaysInMonth(date: DateTime): number {
    return date.daysInMonth;
  }

  clone(date: DateTime): DateTime {
    return date;
  }

  createDate(year: number, month: number, date: number): DateTime {
    // luxon utc uses 1-12 for dates, but datepicker passes in 0-11 .
    month += 1;
    return DateTime.local(year, month, date);
  }

  today(): DateTime {
    return DateTime.local();
  }

  format(date: DateTime, displayFormat: any): string {
    return date.toFormat(displayFormat);
  }

  addCalendarYears(date: DateTime, years: number): DateTime {
    return date.plus({years});
  }

  addCalendarMonths(date: DateTime, months: number): DateTime {
    return date.plus({months});
  }

  addCalendarDays(date: DateTime, days: number): DateTime {
    return date.plus({days});
  }

  toIso8601(date: DateTime): string {
    return date.toISO();
  }

  isDateInstance(obj: any): boolean {
    return (obj instanceof DateTime);
  }

  isValid(date: DateTime): boolean {
    return date.isValid;
  }

  invalid(): DateTime {
    return DateTime.invalid('Invalid set via luxon-date-adapter.');
  }

  parse(value: string, parseFormat?: string): DateTime | null {
    try {
      if (value && typeof value === 'string') {
        // first try to parse an ISO date
        const aDateTime = DateTime.fromISO(value);
        if (aDateTime.isValid) {
          return aDateTime;
        }
        // otherwise try to parse according to specified format (useful for user entered values?).
        return DateTime.fromFormat(value, parseFormat);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Strip out unicode LTR and RTL characters. Edge and IE insert these into formatted dates while
   * other browsers do not. We remove them to make output consistent and because they interfere with
   * date parsing.
   * @param str The string to strip direction characters from.
   * @returns The stripped string.
   */
  private _stripDirectionalityCharacters(str: string): any {
    return str.replace(/[\u200e\u200f]/g, '');
  }

  deserialize(value: any): DateTime | null {
    let date;
    if (value instanceof Date) {
      date = DateTime.fromJSDate(value);
    }
    if (typeof value === 'string') {
      if (!value) {
        return null;
      }
      date = DateTime.fromISO(value);
    }
    if (date && this.isValid(date)) {
      return date;
    }
    return super.deserialize(value);
  }
}
