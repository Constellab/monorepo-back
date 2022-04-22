import {
  LabResourceView,
  LabResourceViewConfig,
  LabResourceViewDisplayMode
} from '../../../model/entities/resource/lab-resource-view.entity';
import {Directive, Input} from '@angular/core';


@Directive()
export class LabResourceViewDirective<T extends LabResourceView = LabResourceView> {

  @Input() view: T;

  @Input() resourceId: string;

  @Input() config: LabResourceViewConfig;

  @Input() displayMode: LabResourceViewDisplayMode = 'fullScreen';

}
