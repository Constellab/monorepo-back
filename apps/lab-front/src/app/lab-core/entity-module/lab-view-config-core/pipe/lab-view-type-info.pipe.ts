import {Pipe, PipeTransform} from '@angular/core';
import {
  labConstResourceViewTypeInfos,
  LabResourceViewType,
  LabResourceViewTypeInfo
} from '../../../model/entities/resource/lab-resource-view.entity';

/**
 * Pipe to get the information about a view type
 */
@Pipe({
  name: 'labViewTypeInfo'
})
export class LabViewTypeInfoPipe implements PipeTransform {

  transform(viewType: LabResourceViewType): LabResourceViewTypeInfo {
    return labConstResourceViewTypeInfos[viewType];
  }

}
