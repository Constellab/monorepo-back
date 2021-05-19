import {LabBaseEntity} from '../global/lab-entity.entity';
import {Expose} from 'class-transformer';
import {ViewModel} from '../global/view-model.entity';

export class BioxResource extends LabBaseEntity {

  @Expose({name: 'job_uri'})
  jobId: string = null;

  @Expose({name: 'experiment_uri'})
  experimentId: string = null;

  data: Record<string, any> = null;
}

export type BioxResourceVM = ViewModel<BioxResource>;

