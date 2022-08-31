import {FlColorHelper} from '../../../utils/fl-color-helper.class';

export const flBioNetworkCompartmentBiomassId: string = 'b';

/**
 * List available compartments
 */
export const flBioNetworkCompartmentColors: Record<string, string> = {
  [flBioNetworkCompartmentBiomassId]: FlColorHelper.brown,
  'c': FlColorHelper.blue, // Cytosol
  'n': FlColorHelper.green, // Nucleus
  'm': FlColorHelper.orange, // Mitochondrion
  'e': FlColorHelper.pink, // Extracellular
  's': FlColorHelper.grey, // Sink
  'r': FlColorHelper.paleGreen, // Endoplas micreticulum
  'v': FlColorHelper.blueGrey, // Vacuole
  'x': FlColorHelper.yellow, // Peroxisome glyoxysome
  'g': FlColorHelper.mallow, // Golgi apparatus
  'p': FlColorHelper.greenShiny, // Periplasm
  'l': FlColorHelper.lightBlue, // Lysosome
  'z': FlColorHelper.palePurple, // Other
};

export function flBioNetworkCompartmentGetColor(compartmentId: string): string{
  const compartmentColor = flBioNetworkCompartmentColors[compartmentId];
  if (compartmentColor) return compartmentColor;

  // as the compartment is a single letter, we duplicate it to have really different colors
  return FlColorHelper.stringToRGBColor(compartmentId + compartmentId + compartmentId
    + compartmentId + compartmentId + compartmentId + compartmentId + compartmentId + compartmentId);
}
