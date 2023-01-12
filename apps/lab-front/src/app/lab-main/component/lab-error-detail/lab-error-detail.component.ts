import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {LabApiError} from '../../../lab-core/model/global/lab-api-error.class';

/**
 * Component showed when the detail button is clicked on a error message
 */
@Component({
  selector: 'lab-error-detail',
  templateUrl: './lab-error-detail.component.html',
  styleUrls: ['./lab-error-detail.component.scss']
})
export class LabErrorDetailComponent implements OnInit {

  error: LabApiError;

  constructor(@Inject(MAT_DIALOG_DATA) error: LabApiError) {
    this.error = error;
  }

  ngOnInit(): void {
  }

}
