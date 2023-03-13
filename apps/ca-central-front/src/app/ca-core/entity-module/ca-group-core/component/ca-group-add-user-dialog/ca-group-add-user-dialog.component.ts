import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {FormControl} from '@ngneat/reactive-forms';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {Validators} from '@angular/forms';
import {
  CaSelectUserMode
} from '../../../ca-user-core/component/ca-select-user-options/ca-select-user-options.component';


export interface CaGroupAddUserDialogInput {
  // method to add the user to the group
  addUserToGroup: (userId: string) => Observable<any>;
  title: string;
  successMessage: string;
  selectUserMode?: CaSelectUserMode;
}

/**
 * Dialog to add a user to a group or an space
 */
@Component({
  selector: 'ca-group-add-user-dialog',
  templateUrl: './ca-group-add-user-dialog.component.html',
  styleUrls: ['./ca-group-add-user-dialog.component.scss']
})
export class CaGroupAddUserDialogComponent implements OnInit {

  formControl: FormControl<CaUser>;

  isLoading: boolean = false;

  selectUserMode: CaSelectUserMode;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaGroupAddUserDialogInput,
              private dialogRef: MatDialogRef<CaGroupAddUserDialogComponent>,
              private snackBarService: FlSnackBarService) {
    this.selectUserMode = input.selectUserMode;
  }

  ngOnInit(): void {
    this.formControl = new FormControl<CaUser>(null, Validators.required);
  }

  get title(): string {
    return this.input.title;
  }

  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.addUserToSpace(this.formControl.value.id);
    }
  }

  private addUserToSpace(userId: string): void {
    this.isLoading = true;
    this.input.addUserToGroup(userId).subscribe({
      next: user => this.addUserSuccess(user),
      error: () => this.isLoading = false
    });
  }

  private addUserSuccess(user: any): void {
    this.snackBarService.openSuccessMessage({text: this.input.successMessage, translateText: true});
    this.isLoading = false;
    this.dialogRef.close(user);
  }

}
