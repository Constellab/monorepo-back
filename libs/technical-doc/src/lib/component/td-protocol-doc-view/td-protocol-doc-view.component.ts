import {Component, Input, OnInit} from '@angular/core';
import {TdProtocolType} from '../../model/td-protocol-type.entity';

@Component({
  selector: 'td-protocol-doc-view',
  templateUrl: './td-protocol-doc-view.component.html',
  styleUrls: ['./td-protocol-doc-view.component.scss']
})
export class TdProtocolDocViewComponent implements OnInit {

  @Input()
  protocol: TdProtocolType;

  type: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
