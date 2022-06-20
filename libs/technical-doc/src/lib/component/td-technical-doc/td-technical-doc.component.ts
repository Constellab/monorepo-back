import {Component, Input, OnInit} from '@angular/core';
import {TdTypeEntity} from '../../model/td-type.entity';

@Component({
  selector: 'td-technical-doc',
  templateUrl: './td-technical-doc.component.html',
  styleUrls: ['./td-technical-doc.component.scss']
})
export class TdTechnicalDocComponent implements OnInit {

  @Input()
  technicalDoc: TdTypeEntity;


  constructor() {
  }

  ngOnInit(): void {

  }

}
