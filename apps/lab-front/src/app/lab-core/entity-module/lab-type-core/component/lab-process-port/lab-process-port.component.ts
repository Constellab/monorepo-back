import {Component, Input, OnInit} from '@angular/core';
import {LabIOSpec} from '../../../../model/entities/lab-io.entity';

@Component({
  selector: 'lab-process-port',
  templateUrl: './lab-process-port.component.html',
  styleUrls: ['./lab-process-port.component.scss']
})
export class LabProcessPortComponent implements OnInit {

  @Input() name: string;

  @Input() specs: LabIOSpec;

  constructor() {
  }

  ngOnInit(): void {
  }

}
