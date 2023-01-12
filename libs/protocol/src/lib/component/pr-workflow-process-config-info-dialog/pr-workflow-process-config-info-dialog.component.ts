import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {PrConfig} from '@monorepo/protocol';
import {TdParamSpec} from '@monorepo/technical-doc';

@Component({
  selector: 'pr-workflow-process-config-info-dialog',
  templateUrl: './pr-workflow-process-config-info-dialog.component.html',
  styleUrls: ['./pr-workflow-process-config-info-dialog.component.scss']
})
export class PrWorkflowProcessConfigInfoDialogComponent implements OnInit {

  displayedColumns: string[] = ['human_name', 'short_description', 'default_value'];
  configDataSource: TdParamSpec[];

  constructor(@Inject(MAT_DIALOG_DATA) config: PrConfig) {
    this.configDataSource = Object.values(config.specs);
  }

  ngOnInit(): void {

  }


}
