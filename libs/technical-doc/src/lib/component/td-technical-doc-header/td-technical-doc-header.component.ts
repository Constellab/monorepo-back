import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FlColorHelper} from '@monorepo/front-core-lib';
import {TdTypeEntity} from '../../model/td-type.entity';

@Component({
  selector: 'td-technical-doc-header',
  templateUrl: './td-technical-doc-header.component.html',
  styleUrls: ['./td-technical-doc-header.component.scss']
})
export class TdTechnicalDocHeaderComponent implements OnInit, OnChanges {

  @Input()
  technicalDoc: TdTypeEntity;

  color: string;

  constructor() {
  }

  ngOnInit(): void {
    this.setColor(this.technicalDoc.typingName);
  }

  ngOnChanges(): void{
    this.setColor(this.technicalDoc.typingName);
  }

  private setColor(typingName: string): void{
    this.color = FlColorHelper.stringToRGBColor(typingName);
  }
}
