import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {LabLogsBetweenDates} from '../../../model/entities/lab-log.entity';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';


export interface LabLogBetweenDatesDialogInput {
  title: string;
  logs$: Observable<LabLogsBetweenDates>;
}

/**
 * Dialog to show logs between 2 dates useful to see the process logs
 */
@Component({
  selector: 'lab-logs-between-dates-dialog',
  templateUrl: './lab-logs-between-dates-dialog.component.html',
  styleUrls: ['./lab-logs-between-dates-dialog.component.scss']
})
export class LabLogsBetweenDatesDialogComponent implements OnInit {

  title: string;
  logs$: Observable<LabLogsBetweenDates>;

  constructor(@Inject(MAT_DIALOG_DATA) input: LabLogBetweenDatesDialogInput) {
    this.title = input.title;
    this.logs$ = input.logs$;
  }

  ngOnInit(): void {
  }

}
