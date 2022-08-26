import {Component, Input, OnInit} from '@angular/core';
import {LabResourceViewType} from '../../../../model/entities/resource/lab-resource-view.entity';

@Component({
  selector: 'lab-view-type-image',
  templateUrl: './lab-view-type-image.component.html',
  styleUrls: ['./lab-view-type-image.component.scss']
})
export class LabViewTypeImageComponent implements OnInit {

  @Input() viewType: LabResourceViewType;

  @Input() size: string = '1em';

  constructor() {
  }

  ngOnInit(): void {
  }

}
