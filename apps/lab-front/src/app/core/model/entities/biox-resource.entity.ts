import {LabBaseEntity} from '../global/lab-entity.entity';
import {ViewModel} from '../global/view-model.entity';

export class BioxResource extends LabBaseEntity {

  data: Record<string, any> = null;
}

export type BioxResourceVM = ViewModel<BioxResource>;

