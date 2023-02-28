import {Pipe, PipeTransform} from '@angular/core';
import {FlExternalLinkService} from '../../../service/fl-external-link.service';

/**
 * Simple pipe to generate link from object name and type
 */
@Pipe({
  name: 'flBioNetworkLink'
})
export class FlBioNetworkLinkPipe implements PipeTransform {

  transform(value: string, type: 'rhea' | 'chebi' | 'brenda'): string {
    if (!value) return null;

    switch (type) {
      case 'rhea':
        return FlExternalLinkService.getRheaDatabaseReactionLink(value);
      case 'chebi':
        return FlExternalLinkService.getChebiLink(value);
      case 'brenda':
        return FlExternalLinkService.getBrendaLink(value);
      default:
        return null;
    }
  }

}
