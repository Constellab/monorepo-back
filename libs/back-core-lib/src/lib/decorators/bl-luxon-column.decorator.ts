import { ClDateHelper, ClLuxonDateTimeTransform, ClLuxonDateTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { Column, ColumnOptions } from 'typeorm';
import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';

/**
 * Config for the LuxonDateColumn and LuxonDateTimeColumn
 */
export interface BlLuxonDateColumnConfig {
  nullable?: boolean;
  update?: boolean;
  unique?: boolean;
  comment?: string;
  default?: any;
}

/**
 * Decorator to declare a Date TypeOrm column using Luxon date
 * It also includes the transformation using YYYY-MM-DD format
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function BlLuxonDateColumn(config?: BlLuxonDateColumnConfig): PropertyDecorator {
  // construct TypeOrm transformer
  const transformer: ValueTransformer = {
    // from object to DB
    to: (value: DateTime): string | null => {
      if (!(value instanceof DateTime)) return value;
      return ClDateHelper.serializeDate(value);
    },
    // from DB to object
    from: (value: Date): DateTime | null => (value == null ? null : ClDateHelper.getDate(value)),
  };

  // TypeOrm column config for Date using Luxon
  const transformOptions: ColumnOptions = { transformer: transformer, type: 'date' };

  // complete the config with the option of LuxonDateColumn and get column decorator
  const column: PropertyDecorator = Column(Object.assign(transformOptions, config));
  // get dateTime transform decorator
  const dateTransform: PropertyDecorator = ClLuxonDateTransform();

  return (target: any, property: string | symbol): void => {
    column(target, property);
    dateTransform(target, property);
  };
}

/**
 * Decorator to declare a DateTime TypeOrm column using Luxon date
 * It also includes the transformation using ISO string
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function BlLuxonDateTimeColumn(config?: BlLuxonDateColumnConfig): PropertyDecorator {
  // construct TypeOrm transformer
  const transformer: ValueTransformer = {
    // from object to DB
    to: (value: DateTime): string | null => {
      if (!(value instanceof DateTime)) return value;
      return ClDateHelper.serializeDateTime(value);
    },
    // from DB to object
    from: (value: Date): DateTime | null => (value == null ? null : ClDateHelper.getDate(value)),
  };

  // TypeOrm column config for DateTime using Luxon
  const transformOptions: ColumnOptions = { transformer: transformer, type: 'datetime' };

  // complete the config with the option of LuxonDateColumn and get column decorator
  const column: PropertyDecorator = Column(Object.assign(transformOptions, config));
  // get dateTime transform decorator
  const dateTimeTransform: PropertyDecorator = ClLuxonDateTimeTransform();

  return (target: any, property: string | symbol): void => {
    column(target, property);
    dateTimeTransform(target, property);
  };
}
