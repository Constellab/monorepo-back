import {Injectable} from '@angular/core';
import {FlDialogService} from '../fl-dialog/fl-dialog.service';
import {MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {FlTagFormDialogComponent, FlTagFormDialogInput} from './component/fl-tag-form-dialog/fl-tag-form-dialog.component';

@Injectable()
export class FlTagDialogService {

  constructor(private dialogService: FlDialogService) {
  }

  public openUpdateTagDialog(input: FlTagFormDialogInput): MatDialogRef<FlTagFormDialogComponent> {
    return this.dialogService.openMediumDialog(FlTagFormDialogComponent, {data: input});
  }
}
