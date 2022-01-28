import {LabBaseEntity} from '../global/lab-entity.entity';
import {LabUser} from './lab-user.entity';
import {LabExperiment} from './lab-experiment.entity';
import {Type} from 'class-transformer';

export class LabQueueJob extends LabBaseEntity {

  @Type(() => LabUser)
  user: LabUser;

  @Type(() => LabExperiment)
  experiment: LabExperiment;
}
