import {FlColorHelper} from '../../../utils/fl-color-helper.class';

export interface FlBioNetworkCompartment {
  id: string;
  name: string;
  color: string;
}

export const flBioNetworkCompartmentBiomass: FlBioNetworkCompartment =
  {id: 'b', name: 'Biomass', color: FlColorHelper.brown};

/**
 * List available compartments
 */
export const flBioNetworkCompartments: FlBioNetworkCompartment[] = [
  flBioNetworkCompartmentBiomass,
  {id: 'c', name: 'Cytosol', color: FlColorHelper.blue},
  {id: 'n', name: 'Nucleus', color: FlColorHelper.green},
  {id: 'm', name: 'Mitochondrion', color: FlColorHelper.orange},
  {id: 'e', name: 'Extracellular', color: FlColorHelper.pink},
  {id: 's', name: 'Sink', color: FlColorHelper.grey},
  {id: 'r', name: 'Endoplasmic reticulum', color: FlColorHelper.paleGreen},
  {id: 'v', name: 'Vacuole', color: FlColorHelper.blueGrey},
  {id: 'x', name: 'Peroxisome glyoxysome', color: FlColorHelper.yellow},
  {id: 'g', name: 'Golgi apparatus', color: FlColorHelper.mallow},
  {id: 'p', name: 'Periplasm', color: FlColorHelper.greenShiny},
  {id: 'l', name: 'Lysosome', color: FlColorHelper.lightBlue},
  {id: 'z', name: 'Other', color: FlColorHelper.palePurple},
];
