import {Component, Inject, OnInit} from '@angular/core';
import {LabMonitorBetweenDates} from '../../../model/entities/lab-monitor.entity';
import {Observable} from 'rxjs';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

export interface LabMonitorBetweenDatesDialogInput {
  title: string;

  monitor$: Observable<LabMonitorBetweenDates>;
}

/**
 * Dialog to show monitor info between 2 dates. Useful to see the process monitor info
 */
@Component({
  selector: 'lab-monitor-between-dates-dialog',
  templateUrl: './lab-monitor-between-dates-dialog.component.html',
  styleUrls: ['./lab-monitor-between-dates-dialog.component.scss']
})
export class LabMonitorBetweenDatesDialogComponent implements OnInit {

  title: string;

  monitor$: Observable<LabMonitorBetweenDates>;

  constructor(@Inject(MAT_DIALOG_DATA) input: LabMonitorBetweenDatesDialogInput) {
    this.title = input.title;
    this.monitor$ = input.monitor$;
  }

  ngOnInit(): void {
  }

}
