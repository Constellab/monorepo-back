import {Component, Inject, OnInit} from '@angular/core';
import {BioxProgressBar} from '../../../../../core/model/entities/biox-progress-bar.entity';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Observable} from 'rxjs';

/**
 * Show information about a {@link BioxProgressBar} in a dialog
 */
@Component({
  selector: 'gen-biox-progress-bar-info-dialog',
  templateUrl: './biox-progress-bar-info-dialog.component.html',
  styleUrls: ['./biox-progress-bar-info-dialog.component.scss']
})
export class BioxProgressBarInfoDialogComponent implements OnInit {

  progressBar$: Observable<BioxProgressBar>;

  constructor(@Inject(MAT_DIALOG_DATA) progressBar$: Observable<BioxProgressBar>) {
    this.progressBar$ = progressBar$;
  }

  ngOnInit(): void {
  }

}
