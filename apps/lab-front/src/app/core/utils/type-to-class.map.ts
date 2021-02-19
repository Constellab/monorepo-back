import {BioxExperiment} from '../model/entities/biox-experiment.entity';


/**
 * Map the db object type to TS class
 * Used to instantiate ViewModel
 */
export const typeToClassMap: Map<string, new() => any> = new Map([
  ['gws.model.Experiment', BioxExperiment]
]);
