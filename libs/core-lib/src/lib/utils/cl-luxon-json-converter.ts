import {JsonConverter, JsonCustomConvert} from 'json2typescript';
import {DateTime} from 'luxon';
import {ClDateHelper, ClDateInput} from './cl-date-helper';


/**
 * Basic luxon convert for json2typescript serialisation/deserialization
 */
@JsonConverter
export class ClLuxonConverter implements JsonCustomConvert<DateTime> {
  serialize(date: DateTime): any {
    if (date == null) {
      return date;
    }
    return date.valueOf();
  }

  deserialize(date: ClDateInput): DateTime {
    if (!date) {
      return null;
    }
    return ClDateHelper.getDate(date);
  }
}
