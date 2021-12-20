import {LabResourceView} from '../../../model/entities/resource/lab-resource-view.entity';
import {Directive, Input} from '@angular/core';


@Directive()
export class LabResourceViewDirective<T extends LabResourceView = LabResourceView> {

  @Input() view: T;

  @Input() fullscreen: boolean;

}
