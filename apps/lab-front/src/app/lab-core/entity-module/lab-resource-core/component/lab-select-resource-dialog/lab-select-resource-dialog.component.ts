import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {FlSavedSearch} from '@monorepo/front-core-lib';

export interface LabSelectResourceDialogInput {
  savedSearches?: FlSavedSearch[];
}

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

  savedSearch: FlSavedSearch[];

  constructor(@Inject(MAT_DIALOG_DATA) data: LabSelectResourceDialogInput,
              private dialogRef: MatDialogRef<LabSelectResourceDialogComponent>) {
    this.savedSearch = data?.savedSearches;
  }

  ngOnInit(): void {
  }

  onResourceSelected(resource: LabResource): void {
    this.dialogRef.close(resource);
  }

}
