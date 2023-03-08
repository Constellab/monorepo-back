import {Component, Input, OnInit} from '@angular/core';
import {LabRunningProcessInfo} from '../../../../model/entities/process/lab-process.entity';

@Component({
  selector: 'lab-running-process',
  templateUrl: './lab-running-process.component.html',
  styleUrls: ['./lab-running-process.component.scss']
})
export class LabRunningProcessComponent implements OnInit {

  @Input() runningProcess: LabRunningProcessInfo;

  constructor() {
  }

  ngOnInit(): void {
  }

}
