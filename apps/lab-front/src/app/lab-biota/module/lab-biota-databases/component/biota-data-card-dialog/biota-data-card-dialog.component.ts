import {Component, Inject, OnInit} from '@angular/core';
import {LabBiotaData} from '../../../../model/lab-biota-data.class';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

/**
 * Simple card for biota data
 */
@Component({
  selector: 'lab-biota-data-card-dialog',
  templateUrl: './biota-data-card-dialog.component.html',
  styleUrls: ['./biota-data-card-dialog.component.scss']
})
export class BiotaDataCardDialogComponent implements OnInit {

  biotaData: LabBiotaData;

  constructor(@Inject(MAT_DIALOG_DATA) biotaData: LabBiotaData) {
    this.biotaData = biotaData;
  }

  ngOnInit(): void {
  }

}
