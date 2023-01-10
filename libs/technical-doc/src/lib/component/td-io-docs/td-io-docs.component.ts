import {Component, Input, OnInit} from '@angular/core';
import {TdIOSpec} from '../../model/td-process-type.class';

@Component({
  selector: 'td-io-docs',
  templateUrl: './td-io-docs.component.html',
  styleUrls: ['./td-io-docs.component.scss']
})
export class TdIoDocsComponent implements OnInit {

  @Input()
  ioSpecs: Record<string, TdIOSpec>;

  constructor() {
  }

  ngOnInit(): void {

  }

}
