import {CnExperimentStatus} from './cn-experiment-status.enum';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';

/**
 * Experiment object from the Lab
 */
export class CnLabExperimentDto {
  id: string;
  data: {
    title: string;
    description: string
  }
  status: CnExperimentStatus;

  @ClLuxonDateTimeTransform()
  created_at: DateTime;

  @ClLuxonDateTimeTransform()
  last_modified_at: DateTime;
}
