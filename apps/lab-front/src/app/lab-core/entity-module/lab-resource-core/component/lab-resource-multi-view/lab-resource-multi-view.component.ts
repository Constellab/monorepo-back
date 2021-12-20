import {Component, OnInit} from '@angular/core';
import {LabResourceViewDirective} from '../../model/lab-resource-view-component.class';
import {LabResourceViewMulti} from '../../../../model/entities/resource/lab-resource-view.entity';

@Component({
  selector: 'lab-resource-multi-view',
  templateUrl: './lab-resource-multi-view.component.html',
  styleUrls: ['./lab-resource-multi-view.component.scss']
})
export class LabResourceMultiViewComponent extends LabResourceViewDirective<LabResourceViewMulti>
  implements OnInit {


  ngOnInit(): void {
  }

}
