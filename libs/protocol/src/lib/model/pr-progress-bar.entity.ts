import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';


export type PrProgressBarMessageType = 'SUCCESS' | 'INFO' | 'ERROR' | 'WARNING' | 'PROGRESS'

const prProgressBarMessageTypeDict: FlStatusDict<PrProgressBarMessageType> = {
  INFO: FlStatusHelper.getInfoStatus('INFO'),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
  WARNING: FlStatusHelper.getWarningStatus('WARNING'),
  PROGRESS: FlStatusHelper.getInfoStatus('PROGRESS', 'biox.progress_bar_progress', 'cached')
};

/**
 * Different step of the progress bar, each message has a timestamp
 */
export class PrProgressMessage {

  @ClLuxonDateTimeTransform()
  datetime: DateTime;

  text: string;

  @FlStatusTransform(prProgressBarMessageTypeDict)
  type: FlStatus<PrProgressBarMessageType>;
}

export class PrProgressBarData {

  // % per second
  averageSpeed: number;

  // time when the execution ended
  currentTime: number;

  // duration of the process in second
  elapsedTime: number;

  maxValue: number;

  // list of messages for the different steps of the progress
  messages: PrProgressMessage[];

  // in second
  remainingTime: number;

  // time when the execution started
  startTime: number;

  value: number;
}

export class PrProgressBar {

  process: { id: string, type: string };

  data: PrProgressBarData;

  // return true if the progress as started (can be running or finished)
  wasStarted(): boolean {
    return this.data.elapsedTime > 0;
  }

  // get in percentage the progress
  getProgress(): number {
    return (this.data.value / this.data.maxValue) * 100;
  }
}
