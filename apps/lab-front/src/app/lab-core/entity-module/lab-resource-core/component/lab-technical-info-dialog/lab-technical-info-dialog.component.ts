import {Component, Inject, OnInit} from '@angular/core';
import {LabTechnicalInfo} from '../../../../model/entities/resource/lab-technical-info.class';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

/**
 * Dialog to show technical information about a resource or a view
 */
@Component({
  selector: 'lab-technical-info-dialog',
  templateUrl: './lab-technical-info-dialog.component.html',
  styleUrls: ['./lab-technical-info-dialog.component.scss']
})
export class LabTechnicalInfoDialogComponent implements OnInit {

  technicalInfo: LabTechnicalInfo[];

  constructor(@Inject(MAT_DIALOG_DATA) technicalInfo: LabTechnicalInfo[]) {
    this.technicalInfo = technicalInfo;
  }

  ngOnInit(): void {
  }
}
