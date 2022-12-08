import {Component, Input, OnInit} from '@angular/core';
import {LabLogCompleteInfo} from '../../../model/entities/lab-log.entity';

@Component({
  selector: 'lab-log-complete-info',
  templateUrl: './lab-log-complete-info.component.html',
  styleUrls: ['./lab-log-complete-info.component.scss']
})
export class LabLogCompleteInfoComponent implements OnInit {

  @Input() log: LabLogCompleteInfo;

  constructor() {
  }

  ngOnInit(): void {
  }

}
