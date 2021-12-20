import {Component, OnInit} from '@angular/core';
import {LabResourceViewDirective} from '../../model/lab-resource-view-component.class';
import {LabResourceViewJson} from '../../../../model/entities/resource/lab-resource-view.entity';

/**
 * Display the resource json
 */
@Component({
  selector: 'lab-resource-json',
  templateUrl: './lab-resource-json.component.html',
  styleUrls: ['./lab-resource-json.component.scss']
})
export class LabResourceJsonComponent extends LabResourceViewDirective<LabResourceViewJson> implements OnInit {


  ngOnInit(): void {
  }

}
