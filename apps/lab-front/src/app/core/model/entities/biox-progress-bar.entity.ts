import {LabBaseEntity} from '../global/lab-entity.entity';
import {Expose, Type} from 'class-transformer';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';


export type BioxProgressBarMessageType = 'SUCCESS' | 'INFO' | 'ERROR' | 'WARNING' | 'PROGRESS'

const bioxProgressBarMessageTypeDict: FlStatusDict<BioxProgressBarMessageType> = {
  INFO: FlStatusHelper.getInfoStatus('INFO'),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
  WARNING: FlStatusHelper.getWarningStatus('WARNING'),
  PROGRESS: FlStatusHelper.getInfoStatus('PROGRESS', 'biox.progress_bar_progress', 'cached')
};

/**
 * Different step of the progress bar, each message has a timestamp
 */
export class BioxProgressMessage {

  @ClLuxonDateTimeTransform()
  datetime: DateTime;

  text: string;

  @FlStatusTransform(bioxProgressBarMessageTypeDict)
  type: FlStatus<BioxProgressBarMessageType>;
}

export class BioxProgressBarData extends LabBaseEntity {

  // % per second
  @Expose({name: 'average_speed'})
  averageSpeed: number;

  // time when the execution ended
  @Expose({name: 'current_time'})
  currentTime: number;

  // duration of the process in second
  @Expose({name: 'elapsed_time'})
  elapsedTime: number;

  @Expose({name: 'max_value'})
  maxValue: number;

  // list of messages for the different steps of the progress
  @Type(() => BioxProgressMessage)
  messages: BioxProgressMessage[];

  // in second
  @Expose({name: 'remaining_time'})
  remainingTime: number;

  // time when the execution started
  @Expose({name: 'start_time'})
  startTime: number;

  value: number;
}


export type BioxProgressBarStatus = 'DRAFT' | 'RUNNING' | 'FINISHED' | 'ARCHIVED'

const bioxProgressBarStatusDict: FlStatusDict<BioxProgressBarStatus> = {
  DRAFT: FlStatusHelper.getInfoStatus('DRAFT'),
  ARCHIVED: FlStatusHelper.getInfoStatus('ARCHIVED'),
  FINISHED: FlStatusHelper.getSuccessStatus('FINISHED'),
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING')
};


export class BioxProgressBar extends LabBaseEntity {

  process: { id: string, type: string };

  @Type(() => BioxProgressBarData)
  data: BioxProgressBarData;

  get status(): FlStatus<BioxProgressBarStatus> {
    if (this.isArchived) {
      return bioxProgressBarStatusDict.ARCHIVED;
    }

    if (this.data.elapsedTime === 0) {
      return bioxProgressBarStatusDict.DRAFT;
    } else if (this.data.value < this.data.maxValue) {
      return bioxProgressBarStatusDict.RUNNING;
    } else {
      return bioxProgressBarStatusDict.FINISHED;
    }
  }


  // return true if the progress as started (can be running or finished)
  wasStarted(): boolean {
    return this.data.elapsedTime > 0;
  }

  // get in percentage the progress
  getProgress(): number {
    return (this.data.value / this.data.maxValue) * 100;
  }
}
