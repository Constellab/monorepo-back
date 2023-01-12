import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

@Component({
  selector: 'ca-experiment-technical-report-resource-dialog',
  templateUrl: './ca-experiment-technical-report-resource-dialog.component.html',
  styleUrls: ['./ca-experiment-technical-report-resource-dialog.component.scss']
})
export class CaExperimentTechnicalReportResourceDialogComponent implements OnInit {

  resourceId: string;

  constructor(@Inject(MAT_DIALOG_DATA) resourceId: string) {
    this.resourceId = resourceId;
  }

  ngOnInit(): void {
  }

}
