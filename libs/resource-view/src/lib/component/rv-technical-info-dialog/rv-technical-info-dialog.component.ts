import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {RvTechnicalInfo} from '../../model/rv-technical-info.class';

/**
 * Dialog to show technical information about a resource or a view
 */
@Component({
  selector: 'rv-technical-info-dialog',
  templateUrl: './rv-technical-info-dialog.component.html',
  styleUrls: ['./rv-technical-info-dialog.component.scss']
})
export class RvTechnicalInfoDialogComponent implements OnInit {

  technicalInfo: RvTechnicalInfo[];

  constructor(@Inject(MAT_DIALOG_DATA) technicalInfo: RvTechnicalInfo[]) {
    this.technicalInfo = technicalInfo;
  }

  ngOnInit(): void {
  }
}
