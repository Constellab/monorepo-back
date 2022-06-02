import {Component, Input, OnInit} from '@angular/core';
import {TdResourceType} from '../../model/td-resource-type.entity';

@Component({
  selector: 'td-technical-doc',
  templateUrl: './td-technical-doc.component.html',
  styleUrls: ['./td-technical-doc.component.scss']
})
export class TdTechnicalDocComponent implements OnInit {

  @Input()
  technicalDoc: TdResourceType;

  constructor() {
  }

  ngOnInit(): void {
  }

}
