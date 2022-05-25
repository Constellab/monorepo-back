import {Component, Input, OnInit} from '@angular/core';
import {TdIOSpecDTO} from '@monorepo/technical-doc';

@Component({
  selector: 'lab-process-port',
  templateUrl: './lab-process-port.component.html',
  styleUrls: ['./lab-process-port.component.scss']
})
export class LabProcessPortComponent implements OnInit {

  @Input() name: string;

  @Input() specs: TdIOSpecDTO;

  constructor() {
  }

  ngOnInit(): void {
  }

}
