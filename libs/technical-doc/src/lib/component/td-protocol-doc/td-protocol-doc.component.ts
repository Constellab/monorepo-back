import {Component, Input, OnInit} from '@angular/core';
import {TdProtocolType} from '../../model/td-protocol-type.entity';

@Component({
  selector: 'td-protocol-doc',
  templateUrl: './td-protocol-doc.component.html',
  styleUrls: ['./td-protocol-doc.component.scss']
})
export class TdProtocolDocComponent implements OnInit {

  @Input()
  protocol: TdProtocolType;

  type: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
