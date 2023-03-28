import {LabBaseEntity} from '../global/lab-entity.entity';
import {Expose, Type} from 'class-transformer';
import {ClDateHelper, ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {FlArrayObs, FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';


export type LabProgressBarMessageType = 'SUCCESS' | 'INFO' | 'ERROR' | 'WARNING' | 'PROGRESS' | 'DEBUG';

const labProgressBarMessageTypeDict: FlStatusDict<LabProgressBarMessageType> = {
  DEBUG: FlStatusHelper.getDebugStatus('DEBUG'),
  INFO: FlStatusHelper.getInfoStatus('INFO'),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
  WARNING: FlStatusHelper.getWarningStatus('WARNING'),
  PROGRESS: FlStatusHelper.getInfoStatus('PROGRESS', 'biox.progress_bar_progress', 'cached')
};

/**
 * Different step of the progress bar, each message has a timestamp
 */
export class LabProgressMessage {

  @ClLuxonDateTimeTransform()
  datetime: DateTime;

  text: string;

  @FlStatusTransform(labProgressBarMessageTypeDict)
  type: FlStatus<LabProgressBarMessageType>;

  progress?: number;
}


export class LabProgressBar extends LabBaseEntity {

  @Expose({name: 'started_at'})
  @ClLuxonDateTimeTransform()
  startedAt: DateTime;

  @Expose({name: 'ended_at'})
  @ClLuxonDateTimeTransform()
  endedAt: DateTime;

  // value of the progress between 0 and 100
  @Expose({name: 'current_value'})
  currentValue: number;


  // duration of the process in millisecond
  get elapsedTime(): number {
    if (this.startedAt == null) return 0;

    const endedAt = this.endedAt ?? ClDateHelper.getDate();

    return endedAt.diff(this.startedAt, 'millisecond').milliseconds;
  }
}

/**
 * Object that contains list of messages between 2 date of the progress bar
 */
export class LabProgressBarMessages extends LabProgressBar {

  @Expose({name: 'from_datetime'})
  @ClLuxonDateTimeTransform()
  fromDatetime: DateTime;

  @Expose({name: 'to_datetime'})
  @ClLuxonDateTimeTransform()
  toDatetime: DateTime;

  @Type(() => LabProgressMessage)
  messages: LabProgressMessage[];
}


export class LabProgressMessageDatasource extends FlArrayObs<LabProgressMessage> {
  protected equals(a: LabProgressMessage, b: LabProgressMessage): boolean {
    return a.datetime.equals(b.datetime) && a.text === b.text && a.type.value === b.type.value;
  }



}
