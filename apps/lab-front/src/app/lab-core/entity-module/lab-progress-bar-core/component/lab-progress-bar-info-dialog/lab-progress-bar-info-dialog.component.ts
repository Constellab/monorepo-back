import {Component, Inject, OnInit} from '@angular/core';
import {LabProgressBar} from '../../../../model/entities/lab-progress-bar.entity';
import {Observable} from 'rxjs';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {LabProgressBarService} from '../../../../entity-service/lab-progress-bar.service';
import {map} from 'rxjs/operators';

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

  downloadUrl$: Observable<string>;

  constructor(@Inject(MAT_DIALOG_DATA) progressBar$: Observable<LabProgressBar>,
              private labProgressBarService: LabProgressBarService) {
    this.progressBar$ = progressBar$;
  }

  ngOnInit(): void {
    this.downloadUrl$ = this.progressBar$.pipe(
      map(progressBar => this.labProgressBarService.getDownloadProgressBarUrl(progressBar.id))
    );
  }

}
