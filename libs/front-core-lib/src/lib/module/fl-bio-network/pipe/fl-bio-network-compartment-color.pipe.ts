import {Pipe, PipeTransform} from '@angular/core';
import {flBioNetworkCompartmentGetColor} from '../model/fl-bio-network-compartment.class';

/**
 * Return the color of a compartment
 */
@Pipe({
  name: 'flBioNetworkCompartmentColor'
})
export class FlBioNetworkCompartmentColorPipe implements PipeTransform {

  transform(compartmentId: string): string {
    return flBioNetworkCompartmentGetColor(compartmentId);
  }

}
