import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {LabTypeEntity} from '../../../../model/entities/lab-type/lab-type.entity';

/**
 * Dialog containing the process type search to select one
 */
@Component({
  selector: 'lab-select-process-type-dialog',
  templateUrl: './lab-select-process-type-dialog.component.html',
  styleUrls: ['./lab-select-process-type-dialog.component.scss']
})
export class LabSelectProcessTypeDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<LabSelectProcessTypeDialogComponent>) {
  }

  ngOnInit(): void {
  }

  onTypeSelected(type: LabTypeEntity): void {
    this.dialogRef.close(type);
  }

}
