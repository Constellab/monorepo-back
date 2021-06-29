import {LabBaseEntity} from '../global/lab-entity.entity';
import {Expose, Type} from 'class-transformer';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {FlGetStatusClassColorFunction, FlGetStatusIconFunction, FlStatus} from '@monorepo/front-core-lib';

export type BioxProgressBarStatus = 'draft' | 'running' | 'finished' | 'archived'

/**
 * Different step of the progress bar, each message has a timestamp
 */
export class BioxProgressMessage {

  @ClLuxonDateTimeTransform()
  datetime: DateTime;

  text: string;
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


export class BioxProgressBar extends LabBaseEntity implements FlStatus {

  process: { uri: string, type: string };

  @Type(() => BioxProgressBarData)
  data: BioxProgressBarData;

  getStatusName(): BioxProgressBarStatus {
    if (this.isArchived) {
      return 'archived';
    }

    if (this.data.elapsedTime === 0) {
      return 'draft';
    } else if (this.data.value < this.data.maxValue) {
      return 'running';
    } else {
      return 'finished';
    }
  }

  getStatusIcon(): string {
    return getBioxProgressBarStatusStatusIcon(this.getStatusName());
  }

  getStatusClassColor(mode: 'background' | 'text'): string {
    return getBioxProgressBarStatusColorClass(this.getStatusName(), mode);
  }


  // return true if the progress as started (can be running or finished)
  wasStarted(): boolean {
    return this.data.elapsedTime > 0;
  }

  // get in percentage the progress
  getProgress(): number{
    return (this.data.value / this.data.maxValue) * 100
  }
}


const getBioxProgressBarStatusColorClass: FlGetStatusClassColorFunction = (status: BioxProgressBarStatus,
                                                                           mode: 'background' | 'text' = 'background'): string => {
  switch (status) {
    case 'finished':
      return mode === 'background' ? 'g-primary-background' : 'g-primary-text';
    default:
      return mode === 'background' ? 'g-grey-background' : 'g-grey-text';
  }
};

const getBioxProgressBarStatusStatusIcon: FlGetStatusIconFunction = (status: BioxProgressBarStatus): string => {
  switch (status) {
    case 'archived':
      return 'inventory_2';
    case 'draft':
      return 'edit';
    case 'finished':
      return 'done';
    case 'running':
      return 'cached';
  }
};
