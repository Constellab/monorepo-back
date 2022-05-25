import {Component, Input, OnInit} from '@angular/core';
import {TdTypeObjectType} from '../../model/td-type.entity';
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

  elementProtocol: TdProtocolType;
  elementTask: TdTaskType;
  elementResource: TdResourceType;

  technicalDocType: TdTypeObjectType;

  constructor() {
  }

  ngOnInit(): void {
    this.technicalDocType = this.technicalDoc.objectType;

    switch (this.technicalDocType){
      case "PROTOCOL":
        this.elementProtocol = this.technicalDoc as TdProtocolType;
        break;
      case "TASK":
        this.elementTask = this.technicalDoc as TdTaskType;
        break;
      case "RESOURCE":
        this.elementResource = this.technicalDoc as TdResourceType;
        break;
    }
  }

}
