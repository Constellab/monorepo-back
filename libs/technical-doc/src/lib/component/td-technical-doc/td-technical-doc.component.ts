import {Component, Input, OnInit} from '@angular/core';
import {TdResourceType} from '../../model/td-resource-type.entity';
import {TdTaskType} from '../../model/td-task-type.entity';
import {TdProtocolType} from '../../model/td-protocol-type.entity';

@Component({
  selector: 'td-technical-doc',
  templateUrl: './td-technical-doc.component.html',
  styleUrls: ['./td-technical-doc.component.scss']
})
export class TdTechnicalDocComponent implements OnInit {

  @Input()
  technicalDoc: TdResourceType | TdTaskType | TdProtocolType;

  constructor() {
  }

  ngOnInit(): void {
  }

}
