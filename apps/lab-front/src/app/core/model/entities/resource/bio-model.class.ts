import {BioxBasicResource} from './biox-resource.entity';
import {BioxNetwork} from './biox-network.class';

export const bioxResourceBioModelType: string = 'gena.biomodel.BioModel';

/**
 * A BioModel is a resource that contains multiple network resources
 */
export type BioModel = BioxBasicResource<BioModelData>;

export interface BioModelData {

  name: string;
  description: string;
  biomodel: {
    networks: BioxNetwork[];
  }
}
