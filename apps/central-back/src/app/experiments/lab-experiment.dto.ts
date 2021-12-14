import {ExperimentStatus} from './experiment-status.enum';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';

/**
 * Experiment object from the Lab
 */
export class LabExperimentDto {
  id: string;
  data: {
    title: string;
    description: string
  }
  status: ExperimentStatus;

  @ClLuxonDateTimeTransform()
  created_at: DateTime;

  @ClLuxonDateTimeTransform()
  last_modified_at: DateTime;
}
