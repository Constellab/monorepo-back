import {Component, Inject, OnInit} from '@angular/core';
import {TdTypeEntity} from '@monorepo/technical-doc';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

@Component({
  selector: 'ca-experiment-technical-report-process-doc-dialog',
  templateUrl: './ca-experiment-technical-report-process-doc-dialog.component.html',
  styleUrls: ['./ca-experiment-technical-report-process-doc-dialog.component.scss']
})
export class CaExperimentTechnicalReportProcessDocDialogComponent implements OnInit {

  techDoc: TdTypeEntity;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private input: TdTypeEntity,
  ) {
    this.techDoc = this.input;
  }

  ngOnInit(): void {
  }

}
