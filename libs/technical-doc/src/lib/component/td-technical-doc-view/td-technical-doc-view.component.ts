import {Component, Input, OnInit} from '@angular/core';
import {TdTypeObjectType} from '../../model/td-type.entity';
import {TdProcessType} from '../../model/td-process-type.entity';

@Component({
  selector: 'td-technical-doc-view',
  templateUrl: './td-technical-doc-view.component.html',
  styleUrls: ['./td-technical-doc-view.component.scss']
})
export class TdTechnicalDocViewComponent implements OnInit {

  @Input()
  technicalDoc: TdProcessType;

  technicalDocType: TdTypeObjectType;

  constructor() {
  }

  ngOnInit(): void {
    this.technicalDocType = this.technicalDoc.objectType;
  }

}
