import {Component, Inject, OnInit} from '@angular/core';
import {LabBiotaData} from '../../../../model/lab-biota-data.class';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

/**
 * Simple card for biota data
 */
@Component({
  selector: 'lab-biota-data-card-dialog',
  templateUrl: './lab-biota-data-card-dialog.component.html',
  styleUrls: ['./lab-biota-data-card-dialog.component.scss']
})
export class LabBiotaDataCardDialogComponent implements OnInit {

  biotaData: LabBiotaData;

  constructor(@Inject(MAT_DIALOG_DATA) biotaData: LabBiotaData) {
    this.biotaData = biotaData;
  }

  ngOnInit(): void {
  }

}
