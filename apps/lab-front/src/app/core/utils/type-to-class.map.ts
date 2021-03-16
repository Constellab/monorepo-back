import {BioxExperiment} from '../model/entities/biox-experiment.entity';
import {BioxProtocol} from '../model/entities/biox-processable.entity';

type TypeToClass = {
  [key: string]: new() => any;
};

/**
 * Map the db object type to TS class
 * Used to instantiate ViewModel
 */
export const typeToClassMap: TypeToClass = {
  'gws.model.Protocol': BioxProtocol,
  'gws.model.Experiment': BioxExperiment
};
