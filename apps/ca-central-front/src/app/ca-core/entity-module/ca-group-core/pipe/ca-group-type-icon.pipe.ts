import {Pipe, PipeTransform} from '@angular/core';
import {CaGroupType, caGroupTypeIcons} from '../../../model/entities/ca-group.entity';

/**
 * Component to return the icon associated with the group type
 * The icon must be used in FlIcon directive
 */
@Pipe({
  name: 'caGroupTypeIcon'
})
export class CaGroupTypeIconPipe implements PipeTransform {

  transform(groupType: CaGroupType): string {
    return caGroupTypeIcons[groupType];
  }

}
