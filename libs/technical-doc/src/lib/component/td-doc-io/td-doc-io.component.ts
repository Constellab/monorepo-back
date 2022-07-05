import {Component, Input, OnInit} from '@angular/core';
import {TdIOSpec} from '@monorepo/technical-doc';

@Component({
  selector: 'td-doc-io',
  templateUrl: './td-doc-io.component.html',
  styleUrls: ['./td-doc-io.component.scss']
})
export class TdDocIoComponent implements OnInit {

  @Input()
  ioSpec: TdIOSpec;

  constructor() { }

  ngOnInit(): void {
  }

}
