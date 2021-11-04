import {Component, Inject, OnInit} from '@angular/core';
import {BiotaData} from '../../../../model/biota-data.class';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

/**
 * Simple card for biota data
 */
@Component({
  selector: 'gen-biota-data-card-dialog',
  templateUrl: './biota-data-card-dialog.component.html',
  styleUrls: ['./biota-data-card-dialog.component.scss']
})
export class BiotaDataCardDialogComponent implements OnInit {

  biotaData: BiotaData;

  constructor(@Inject(MAT_DIALOG_DATA) biotaData: BiotaData) {
    this.biotaData = biotaData;
  }

  ngOnInit(): void {
  }

}
