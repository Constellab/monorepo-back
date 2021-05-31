import {LabBaseEntity} from '../global/lab-entity.entity';
import {ViewModel} from '../global/view-model.entity';
import {FileResource} from './file-resource.entity';

export type BioxResource = BioxBasicResource | FileResource;

export class BioxBasicResource extends LabBaseEntity {

  data: Record<string, any>;

  isFile(): boolean {
    return this.type === 'gws.file.File';
  }
}

export type BioxResourceVM = ViewModel<BioxResource>;

