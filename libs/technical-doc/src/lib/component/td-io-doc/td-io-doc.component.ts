import {Component, Input, OnInit} from '@angular/core';
import {TdIOSpec} from '../../model/td-process-type.entity';

@Component({
  selector: 'td-io-doc',
  templateUrl: './td-io-doc.component.html',
  styleUrls: ['./td-io-doc.component.scss']
})
export class TdIoDocComponent implements OnInit {

  @Input()
  ioSpecs: Record<string, TdIOSpec>;

  constructor() {
  }

  ngOnInit(): void {

  }

}
