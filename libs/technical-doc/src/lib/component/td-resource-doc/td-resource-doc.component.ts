import {Component, Input, OnInit} from '@angular/core';
import {TdResourceType} from '../../model/td-resource-type.class';

@Component({
  selector: 'td-resource-doc',
  templateUrl: './td-resource-doc.component.html',
  styleUrls: ['./td-resource-doc.component.scss']
})
export class TdResourceDocComponent implements OnInit {

  @Input()
  resource: TdResourceType;

  constructor() {
  }

  ngOnInit(): void {
  }

}
