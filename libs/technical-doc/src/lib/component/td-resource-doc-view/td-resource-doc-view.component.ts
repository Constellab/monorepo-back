import {Component, Input, OnInit} from '@angular/core';
import {TdResourceType} from '../../model/td-resource-type.entity';

@Component({
  selector: 'td-resource-doc-view',
  templateUrl: './td-resource-doc-view.component.html',
  styleUrls: ['./td-resource-doc-view.component.scss']
})
export class TdResourceDocViewComponent implements OnInit {

  @Input()
  resource: TdResourceType;

  constructor() {
  }

  ngOnInit(): void {
  }

}
