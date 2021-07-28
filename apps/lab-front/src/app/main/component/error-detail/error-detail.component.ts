import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {LabApiError} from '../../../core/model/global/lab-api-error.class';

/**
 * Component showed when the detail button is clicked on a error message
 */
@Component({
  selector: 'gen-error-detail',
  templateUrl: './error-detail.component.html',
  styleUrls: ['./error-detail.component.scss']
})
export class ErrorDetailComponent implements OnInit {

  error: LabApiError;

  constructor(@Inject(MAT_DIALOG_DATA) error: LabApiError) {
    this.error = error;
  }

  ngOnInit(): void {
  }

}
