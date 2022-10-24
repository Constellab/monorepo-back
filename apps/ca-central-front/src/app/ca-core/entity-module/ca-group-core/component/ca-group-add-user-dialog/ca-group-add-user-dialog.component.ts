import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {FormControl} from '@ngneat/reactive-forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {Validators} from '@angular/forms';


export interface CaGroupAddUserDialogInput {
  // method to add the user to the group
  addUserToGroup: (userId: string) => Observable<any>;
  title: string;
  successMessage: string;
}

/**
 * Dialog to add a user to a group or an organization
 */
@Component({
  selector: 'ca-group-add-user-dialog',
  templateUrl: './ca-group-add-user-dialog.component.html',
  styleUrls: ['./ca-group-add-user-dialog.component.scss']
})
export class CaGroupAddUserDialogComponent implements OnInit {

  formControl: FormControl<CaUser>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaGroupAddUserDialogInput,
              private dialogRef: MatDialogRef<CaGroupAddUserDialogComponent>,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formControl = new FormControl<CaUser>(null, Validators.required);
  }

  get title(): string {
    return this.input.title;
  }

  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.addUserToOrganization(this.formControl.value.id);
    }
  }

  private addUserToOrganization(userId: string): void {
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
