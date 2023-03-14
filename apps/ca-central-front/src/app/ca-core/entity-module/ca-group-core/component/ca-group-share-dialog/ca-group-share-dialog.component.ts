import {Component, Inject, OnInit} from '@angular/core';
import {CaGroup} from '../../../../model/entities/ca-group.entity';
import {Observable} from 'rxjs';
import {FormControl} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface CaGroupShareDialogInput {
  // method call to share object with the group
  share: (group: CaGroup) => Observable<any>;
}

/**
 * Dialog to share an object to a group
 */
@Component({
  selector: 'ca-group-share-dialog',
  templateUrl: './ca-group-share-dialog.component.html',
  styleUrls: ['./ca-group-share-dialog.component.scss']
})
export class CaGroupShareDialogComponent implements OnInit {

  formControl: FormControl<CaGroup>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaGroupShareDialogInput,
              private dialogRef: MatDialogRef<CaGroupShareDialogComponent>,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formControl = new FormControl<CaGroup>(null, Validators.required);
  }

  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.shareObject(this.formControl.value);
    }
  }

  private shareObject(group: CaGroup): void {
    this.isLoading = true;
    this.input.share(group).subscribe({
      next: result => this.shareObjectSuccess(result),
      error: () => this.isLoading = false
    });
  }

  private shareObjectSuccess(result: any): void {
    this.snackBarService.openSuccessMessage({text: 'object_shared', translateText: true});
    this.isLoading = false;
    this.dialogRef.close(result);
  }

}
