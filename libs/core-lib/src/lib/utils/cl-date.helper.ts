import { Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { ClHelpService } from './cl-help.service';

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
  public static readonly ONE_MILLISECOND = 1;
  public static readonly ONE_SECOND = ClDateHelper.ONE_MILLISECOND * 1000;
  public static readonly ONE_MINUTE = ClDateHelper.ONE_SECOND * 60;
  public static readonly ONE_HOUR = ClDateHelper.ONE_MINUTE * 60;
  public static readonly ONE_DAY = ClDateHelper.ONE_HOUR * 24;
  public static readonly ONE_WEEK = ClDateHelper.ONE_DAY * 7;
  // considering one year is 365 days
  public static readonly ONE_YEAR = ClDateHelper.ONE_DAY * 365;

  private static logger = new Logger(ClDateHelper.name);

  constructor() {}

  /**
   * Get dateTime from date
   * @param date date to convert to dateTime (if null return current dateTime)
   */
  public static getDate(date?: ClDateInput): DateTime {
    if (date == null) {
      return DateTime.local();
    }

    return ClDateHelper.convertDateInputToDate(date);
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

  /**
   * Deserialize luxon Date from 'YYYY-MM-DD'
   * If more characters are provided (like time and timezone), they are ignored
   */
  public static deserializeDate(date: string): DateTime {
    if (ClHelpService.isNullOrEmpty(date)) {
      return null;
    }

    if (typeof date !== 'string') {
      this.logger.error(`[ClDateHelper][DeserializeDate] The date ${date} has a wrong format`);
      return null;
    }

    if (date.length < 10) {
      this.logger.error(`[ClDateHelper][DeserializeDate] The date ${date} is too short`);
      return null;
    }

    return ClDateHelper.getDate(date.substr(0, 10));
  }

  /**
   * Serializer luxon Date to 'YYYY-MM-DD' format
   */
  public static serializeDate(date: DateTime): string {
    if (date == null) {
      return null;
    }

    if (!(date instanceof DateTime)) {
      this.logger.error(`[ClDateHelper][SerializeDate] The date ${date} is not a DateTime`);
      return null;
    }

    return date.toISODate();
  }

  /**
   * Deserializer luxon DateTime from ISO format
   */
  public static deserializeDateTime(date: string): DateTime {
    if (ClHelpService.isNullOrEmpty(date)) {
      return null;
    }

    if (typeof date !== 'string') {
      this.logger.error(`[ClDateHelper][DeserializeDateTime] The date ${date} has a wrong format`);
      return null;
    }

    return ClDateHelper.getDate(date);
  }

  /**
   * Serializer luxon DateTime to ISO format
   */
  public static serializeDateTime(date: DateTime): string {
    if (date == null) {
      return null;
    }

    if (!(date instanceof DateTime)) {
      this.logger.error(`[ClDateHelper][SerializeDate] The date ${date} is not a DateTime`);
      return null;
    }

    return date.toISO();
  }
}
