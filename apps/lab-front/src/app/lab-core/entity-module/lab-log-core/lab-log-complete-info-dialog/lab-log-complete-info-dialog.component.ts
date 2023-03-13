import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {LabLogCompleteInfo} from '../../../model/entities/lab-log.entity';
import {LabLogService} from '../../../entity-service/lab-log.service';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

export interface LabLogCompleteInfoDialogInput {
  logName: string;
}

@Component({
  selector: 'lab-log-complete-info-dialog',
  templateUrl: './lab-log-complete-info-dialog.component.html',
  styleUrls: ['./lab-log-complete-info-dialog.component.scss']
})
export class LabLogCompleteInfoDialogComponent implements OnInit {

  logName: string;

  labLogCompleteInfo$: Observable<LabLogCompleteInfo>;

  constructor(@Inject(MAT_DIALOG_DATA) private input: LabLogCompleteInfoDialogInput,
              private logService: LabLogService) {
  }

  ngOnInit(): void {
    this.logName = this.input.logName;
    this.labLogCompleteInfo$ = this.logService.getCompleteLog(this.input.logName);
  }

}
