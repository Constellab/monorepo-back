import {Pipe, PipeTransform} from '@angular/core';
import {LabResourceViewType} from '../../../model/entities/resource/lab-resource-view.entity';
import {labConstResourceViewTypeInfos} from '../../../model/entities/resource/lab-resource-view-type.class';
import {RvResourceViewTypeInfo} from '@monorepo/resource-view';

/**
 * Pipe to get the information about a view type
 */
@Pipe({
  name: 'labViewTypeInfo'
})
export class LabViewTypeInfoPipe implements PipeTransform {

  transform(viewType: LabResourceViewType): RvResourceViewTypeInfo {
    return labConstResourceViewTypeInfos[viewType];
  }

}
