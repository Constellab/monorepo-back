import {Component, Input, OnInit} from '@angular/core';
import {LabLogsBetweenDates} from '../../../model/entities/lab-log.entity';

@Component({
  selector: 'lab-logs-between-dates',
  templateUrl: './lab-logs-between-dates.component.html',
  styleUrls: ['./lab-logs-between-dates.component.scss']
})
export class LabLogsBetweenDatesComponent implements OnInit {

  @Input() logs: LabLogsBetweenDates;

  constructor() { }

  ngOnInit(): void {
  }

}
