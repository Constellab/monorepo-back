import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';

/**
 * Dialog to search on resource and select one
 *
 * The dialog is closed when a resource is selected
 */
@Component({
  selector: 'lab-select-resource-dialog',
  templateUrl: './lab-select-resource-dialog.component.html',
  styleUrls: ['./lab-select-resource-dialog.component.scss']
})
export class LabSelectResourceDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<LabSelectResourceDialogComponent>) {
  }

  ngOnInit(): void {
  }

  onResourceSelected(resource: LabResource): void {
    this.dialogRef.close(resource);
  }

}
