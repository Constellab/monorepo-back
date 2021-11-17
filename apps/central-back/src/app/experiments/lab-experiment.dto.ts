import {ExperimentStatus} from './experiment-status.enum';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';

/**
 * Experiment object from the Lab
 */
export class LabExperimentDto {
  uri: string;
  data: {
    title: string;
    description: string
  }
  status: ExperimentStatus;

  @ClLuxonDateTimeTransform()
  creation_datetime: DateTime;

  @ClLuxonDateTimeTransform()
  save_datetime: DateTime;
}
