// Use another variable for import see
// https://github.com/ng-packagr/ng-packagr/issues/217

import {Moment} from 'moment';
import {DateInput, moment} from '../model/global/date.class';
import {StringHelper} from './string-helper';

/**
 * Help that regroup functions to works with Dates
 *
 * It works with moment
 */
export class DateHelper {

  public static readonly ONE_MINUTE = 1000 * 60;
  public static readonly ONE_HOUR = DateHelper.ONE_MINUTE * 60;
  public static readonly ONE_DAY = DateHelper.ONE_HOUR * 24;
  public static readonly ONE_WEEK = DateHelper.ONE_DAY * 7;
  // considering one year is 365 days
  public static readonly ONE_YEAR = DateHelper.ONE_DAY * 365;

  constructor() {
  }


  /**
   * Get moment from date
   * @param date date to convert to moment (if null return current moment)
   */
  public static getMoment(date ?: DateInput): Moment {
    if (date == null) {
      return moment();
    }

    return DateHelper.convertDateInputToMoment(date);
  }

  /**
   * Returns the moment of today with time of 00h00m00s00ms
   */
  public static getTodayMomentWithoutTime(): Moment {
    return moment().set({hour: 0, minute: 0, second: 0, millisecond: 0});
  }

  /**
   * Get the age in complete year of a date (can be negative)
   * @param date date
   */
  public static getAge(date: DateInput): number {
    return DateHelper.getDifferenceInCompleteYears(date, new Date());
  }

  /**
   * Returns the difference in complete years of 2 dates. Returns positive if the DateAfter > DateBefore
   * @param dateBefore date
   * @param dateAfter date
   */
  public static getDifferenceInCompleteYears(dateBefore: DateInput, dateAfter: DateInput): number {
    const dateA = DateHelper.convertDateInputToMoment(dateAfter);
    const dateB = DateHelper.convertDateInputToMoment(dateBefore);

    return dateA.diff(dateB, 'years');
  }

  /**
   * Return the difference in millisecond between two data. Returns positive if the DateAfter > DateBefore
   * @param dateBefore date
   * @param dateAfter date
   */
  public static getDifference(dateBefore: DateInput, dateAfter: DateInput): number {
    const dateA = DateHelper.convertDateInputToMoment(dateAfter);
    const dateB = DateHelper.convertDateInputToMoment(dateBefore);

    return dateA.valueOf() - dateB.valueOf();
  }

  /**
   * Use to set the time from a time input to a date input
   * @param time as string format like hh:mm
   * @param date date
   */
  public static setTimeToDateInput(time: string, date: DateInput): Moment {
    if (!time || !date) {
      return date as Moment;
    }

    const m = DateHelper.convertDateInputToMoment(date);

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
  public static convertDateToTimeInput(date: DateInput): string {
    if (date == null) {
      return '';
    }

    const m = DateHelper.convertDateInputToMoment(date);
    return m.format('HH:mm');
  }

  /**
   * Return true if the 2 dates are the same day
   * Return false if one of the 2 dates are null
   * @param date1 date
   * @param date2 date
   */
  public static isSameDate(date1: Date, date2: Date): boolean {
    if (date1 == null || date2 == null) {
      return false;
    }

    return DateHelper.getMoment(date1).diff(date2, 'days') === 0;
  }

  /**
   * Convert a Date to text such as '5 days ago'
   *
   * Use the moment local setup by the translate service
   * @param date date
   * @param capitalize if true capitalize string
   * @param withoutText without the 'ago' or 'il y a'
   */
  public static fromNow(date: DateInput, capitalize: boolean = false,
                        withoutText: boolean = false): string {
    if (!date) {
      return '';
    }
    // convert to moment
    const m = DateHelper.convertDateInputToMoment(date);

    // get from now string
    let fromNow: string = m.fromNow(withoutText);

    // capitalize if necessary
    if (capitalize) {
      fromNow = StringHelper.capitalize(fromNow);
    }
    return fromNow;
  }


  public static convertDateInputToMoment(date: DateInput): Moment {
    return moment(date);
  }
}
