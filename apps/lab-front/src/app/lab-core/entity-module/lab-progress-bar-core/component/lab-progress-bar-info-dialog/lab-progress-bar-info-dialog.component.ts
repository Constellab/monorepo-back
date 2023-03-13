import {Component, Inject, OnInit} from '@angular/core';
import {LabProgressBar} from '../../../../model/entities/lab-progress-bar.entity';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {Observable} from 'rxjs';

/**
 * Show information about a {@link LabProgressBar} in a dialog
 */
@Component({
  selector: 'lab-progress-bar-info-dialog',
  templateUrl: './lab-progress-bar-info-dialog.component.html',
  styleUrls: ['./lab-progress-bar-info-dialog.component.scss']
})
export class LabProgressBarInfoDialogComponent implements OnInit {

  progressBar$: Observable<LabProgressBar>;

  constructor(@Inject(MAT_DIALOG_DATA) progressBar$: Observable<LabProgressBar>) {
    this.progressBar$ = progressBar$;
  }

  ngOnInit(): void {
  }

}
