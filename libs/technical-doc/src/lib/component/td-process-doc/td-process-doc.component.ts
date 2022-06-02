import {Component, Input, OnInit} from '@angular/core';
import {TdProcessType} from '../../model/td-process-type.entity';

@Component({
  selector: 'td-process-doc',
  templateUrl: './td-process-doc.component.html',
  styleUrls: ['./td-process-doc.component.scss']
})
export class TdProcessDocComponent implements OnInit {

  @Input()
  process: TdProcessType;

  type: string;

  constructor() {
  }

  ngOnInit(): void {

  }
}
