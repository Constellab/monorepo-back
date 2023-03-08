import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {LabLogsBetweenDates} from '../../../model/entities/lab-log.entity';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';


export interface LabLogBetweenDatesDialogInput {
  title: string;
  logs$: Observable<LabLogsBetweenDates>;
  downloadUrl?: string;
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
  downloadUrl?: string;

  constructor(@Inject(MAT_DIALOG_DATA) input: LabLogBetweenDatesDialogInput) {
    this.title = input.title;
    this.logs$ = input.logs$;
    this.downloadUrl = input.downloadUrl;
  }

  ngOnInit(): void {
  }

}
