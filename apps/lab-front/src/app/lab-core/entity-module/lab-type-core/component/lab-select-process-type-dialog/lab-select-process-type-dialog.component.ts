import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabTypeEntity} from '../../../../model/entities/lab-type/lab-type.entity';
import {LabTypeSearchConfig} from '../../model/lab-type-advanced-search.class';

export type LabSelectProcessTypeDialogInput = LabTypeSearchConfig;

/**
 * Dialog containing the process type search to select one
 */
@Component({
  selector: 'lab-select-process-type-dialog',
  templateUrl: './lab-select-process-type-dialog.component.html',
  styleUrls: ['./lab-select-process-type-dialog.component.scss']
})
export class LabSelectProcessTypeDialogComponent implements OnInit {

  config: LabTypeSearchConfig;

  constructor(@Inject(MAT_DIALOG_DATA) data: LabSelectProcessTypeDialogInput,
              private dialogRef: MatDialogRef<LabSelectProcessTypeDialogComponent>) {
    this.config = data;
  }

  ngOnInit(): void {
  }

  onTypeSelected(type: LabTypeEntity): void {
    this.dialogRef.close(type);
  }

}
