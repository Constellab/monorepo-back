import {Component, Input, OnInit} from '@angular/core';
import {TdResourceType} from '@monorepo/technical-doc';
import {FlColorHelper} from '@monorepo/front-core-lib';

@Component({
  selector: 'td-technical-doc-header',
  templateUrl: './td-technical-doc-header.component.html',
  styleUrls: ['./td-technical-doc-header.component.scss']
})
export class TdTechnicalDocHeaderComponent implements OnInit {

  @Input()
  technicalDoc: TdResourceType;

  color: string;

  constructor() { }

  ngOnInit(): void {
    this.color = FlColorHelper.stringToRGBColor(
      this.technicalDoc.objectType + '.' + this.technicalDoc.brickName + '.' + this.technicalDoc.humanName
    );
  }

}
