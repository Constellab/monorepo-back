import {DateTime} from 'luxon';
import {ClStringHelper} from './cl-string-helper';

/**
 * Input for {@HelperService} function that support date input. It uses DateInput
 *
 * DateTime format
 * Date (native js) format
 * Number time (millisecond) of the date
 * String
 */
export type ClDateInput = string | number | Date | DateTime;


/**
 * Help that regroup functions to works with Dates
 *
 * It works with Luxon
 */
export class ClDateHelper {

  public static readonly ONE_MINUTE = 1000 * 60;
  public static readonly ONE_HOUR = ClDateHelper.ONE_MINUTE * 60;
  public static readonly ONE_DAY = ClDateHelper.ONE_HOUR * 24;
  public static readonly ONE_WEEK = ClDateHelper.ONE_DAY * 7;
  // considering one year is 365 days
  public static readonly ONE_YEAR = ClDateHelper.ONE_DAY * 365;

  constructor() {
  }


  /**
   * Get dateTime from date
   * @param date date to convert to dateTime (if null return current dateTime)
   */
  public static getDate(date ?: ClDateInput): DateTime {
    if (date == null) {
      return DateTime.local();
    }

    return ClDateHelper.convertDateInputToDate(date);
  }

  /**
   * Returns the dateTime of today with time of 00h00m00s00ms
   */
  public static getTodayDateWithoutTime(): DateTime {
    return this.getDate().set({hour: 0, minute: 0, second: 0, millisecond: 0});
  }

  /**
   * Get the age in complete year of a date (can be negative)
   * @param date date
   */
  public static getAge(date: ClDateInput): number {
    return ClDateHelper.getDifferenceInCompleteYears(date, new Date());
  }

  /**
   * Returns the difference in complete years of 2 dates. Returns positive if the DateAfter > DateBefore
   * @param dateBefore date
   * @param dateAfter date
   */
  public static getDifferenceInCompleteYears(dateBefore: ClDateInput, dateAfter: ClDateInput): number {
    const dateA = ClDateHelper.convertDateInputToDate(dateAfter);
    const dateB = ClDateHelper.convertDateInputToDate(dateBefore);

    return dateA.diff(dateB, 'years').years;
  }

  /**
   * Return the difference in millisecond between two data. Returns positive if the DateAfter > DateBefore
   * @param dateBefore date
   * @param dateAfter date
   */
  public static getDifference(dateBefore: ClDateInput, dateAfter: ClDateInput): number {
    const dateA = ClDateHelper.convertDateInputToDate(dateAfter);
    const dateB = ClDateHelper.convertDateInputToDate(dateBefore);

    return dateA.valueOf() - dateB.valueOf();
  }

  /**
   * Use to set the time from a time input to a date input
   * @param time as string format like hh:mm
   * @param date date
   */
  public static setTimeToDateInput(time: string, date: ClDateInput): DateTime {
    if (!time || !date) {
      return date as DateTime;
    }

    const m = ClDateHelper.convertDateInputToDate(date);

    // split the hour and minutes
    const times = time.split(':');
    if (times.length === 2) {
      m.set({hour: parseInt(times[0], 10), minute: parseInt(times[1], 10)});
    }
    return m;
  }

  /**
   * Convert a date to a string for a time input
   * @param date date
   * @return string formatted like hh:mm
   */
  public static convertDateToTimeInput(date: ClDateInput): string {
    if (date == null) {
      return '';
    }

    const m = ClDateHelper.convertDateInputToDate(date);
    return m.toFormat('HH:mm');
  }

  /**
   * Convert a Date to text such as '5 days ago'
   *
   * Use the dateTime local setup by the translate service
   * @param date date
   * @param capitalize if true capitalize string
   */
  public static fromNow(date: ClDateInput, capitalize: boolean = false): string {
    if (!date) {
      return '';
    }
    // convert to dateTime
    const dateTime = ClDateHelper.convertDateInputToDate(date);

    // get from now string
    let fromNow: string = dateTime.toRelative();

    // capitalize if necessary
    if (capitalize) {
      fromNow = ClStringHelper.capitalize(fromNow);
    }
    return fromNow;
  }


  public static convertDateInputToDate(date: ClDateInput): DateTime {
    if (date === null) {
      return DateTime.local();
    } else if (date instanceof DateTime) {
      return date;
    } else if (date instanceof Date) {
      return DateTime.fromJSDate(date);
    } else if (typeof date === 'number') {
      return DateTime.fromMillis(date);
    } else if (typeof date === 'string') {
      return DateTime.fromISO(date);
    }

    throw new Error('Wrong input for to create date');
  }
}
