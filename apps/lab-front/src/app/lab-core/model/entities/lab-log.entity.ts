import {Expose, Type} from 'class-transformer';
import {FlArrayObs} from '@monorepo/front-core-lib';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';

export class LabLogInfo {
  name: string;

  @Expose({name: 'file_size'})
  fileSize: number;
}

export class LabLogsStatus {
  @Expose({name: 'log_folder'})
  logFolder: string;

  @Type(() => LabLogInfo)
  @Expose({name: 'log_files'})
  logFiles: LabLogInfo[];
}

export class LabLogCompleteInfo {

  @Type(() => LabLogInfo)
  @Expose({name: 'log_info'})
  logInfo: LabLogInfo;

  content: string;
}

// class LogsBetweenDataResponse(TypedDict):
//
// logs: List[LogLine]
// from_date: datetime
// to_date: datetime
// from_experiment: bool

export type LabLogLevel = 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG' | 'PROGRESS' | 'EXCEPTION';

/**
 * Class that represent one line of a log file
 */
export class LabLogLine {
  level: LabLogLevel;

  @Expose({name: 'date_time'})
  datetime: string;

  content: string;

  @Expose({name: 'is_from_experiment'})
  isFromExperiment: boolean;
}

export class LabLogsBetweenDates {

  @Type(() => LabLogLine)
  logs: LabLogLine[];

  @Expose({name: 'from_date'})
  @ClLuxonDateTimeTransform()
  fromDate: DateTime;

  @Expose({name: 'to_date'})
  @ClLuxonDateTimeTransform()
  toDate: DateTime;

  @Expose({name: 'from_experiment'})
  fromExperiment: boolean;
}

export class LabLogsArrayObs extends FlArrayObs<LabLogInfo> {
  protected equals(a: LabLogInfo, b: LabLogInfo): boolean {
    return a.name === b.name;
  }
}
