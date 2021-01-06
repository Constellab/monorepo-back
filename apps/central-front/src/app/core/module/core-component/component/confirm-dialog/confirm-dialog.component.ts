import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogInput, ConfirmDialogResult} from '../../../../model/global/confirm.dialog.class';
import {SnackBarService} from '../../../../service/snack-bar.service';
import {Observable} from 'rxjs';
import {CoreTranslateService} from '../../../translate/service/core-translate.service';

@Component({
  selector: 'gen-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  title: string;
  content: string;

  inputData: ConfirmDialogInput;

  // true if the observable is loading
  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) inputData: ConfirmDialogInput,
              private dialogRef: MatDialogRef<ConfirmDialogComponent>,
              private snackBarService: SnackBarService,
              private translateService: CoreTranslateService
  ) {
    this.inputData = inputData;

    // handle the title and content with translation
    if (inputData.translateTitleAndContent) {
      this.title = this.translateService.translate(inputData.title);
      this.content = this.translateService.translate(inputData.content);
    } else {
      this.title = inputData.title;
      this.content = inputData.content;
    }
  }

  ngOnInit(): void {
    // catch the backdrop click to handle the closing and the object send back
    this.dialogRef.backdropClick()
      .subscribe(() => this.onBackdropClick());
  }

  private onBackdropClick(): void {
    // if the dialog is loading, prevent closing
    if (this.isLoading) {
      return;
    }

    this.closeDialog(false);
  }

  closeDialog(choice: boolean): void {
    if (this.isLoading) {
      return;
    }

    // if there is an observable and the choice is true
    // --> call the observable
    if (this.inputData.observable && choice) {
      this.subscribeObservable(this.inputData.observable);
    }
    // otherwise, return the choice with a null result
    else {
      if (choice && this.inputData.successMessage) {
        this.snackBarService.openSuccessMessage(this.inputData.successMessage, this.inputData.translateMessage);
      }

      const response: ConfirmDialogResult = {
        result: null,
        choice: choice
      };
      this.dialogRef.close(response);
    }
  }

  // subscribe to the observable
  private subscribeObservable(observable: Observable<any>): void {
    this.isLoading = true;
    observable.subscribe(
      result => this.success(result),
      () => this.err()
    );
  }

  // on observable success
  private success(result: any): void {
    if (this.inputData.successMessage) {
      this.snackBarService.openSuccessMessage(this.inputData.successMessage, this.inputData.translateMessage);
    }

    // return the result and close the dialog
    const response: ConfirmDialogResult = {
      result: result,
      choice: true
    };
    this.dialogRef.close(response);

    this.isLoading = false;

  }

  // on observable error, hide the loading
  private err(): void {
    this.isLoading = false;
  }

}

