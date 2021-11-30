import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';

/**
 * Dialog to search on resource and select one
 *
 * The dialog is closed when a resource is selected
 */
@Component({
  selector: 'gen-biox-select-resource-dialog',
  templateUrl: './biox-select-resource-dialog.component.html',
  styleUrls: ['./biox-select-resource-dialog.component.scss']
})
export class BioxSelectResourceDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<BioxSelectResourceDialogComponent>) {
  }

  ngOnInit(): void {
  }

  onResourceSelected(resource: BioxResource): void {
    this.dialogRef.close(resource);
  }

}
