import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface FlLoginDialogInput {
  appRoute?: string;

  disabledFooter: boolean;
}

export interface FlLoginDialogResult {
  success?: boolean;

  response: any;
}

/**
 * Dialog wrapper for the login component
 */
@Component({
  selector: 'fl-login-dialog',
  templateUrl: './fl-login-dialog.component.html',
  styleUrls: ['./fl-login-dialog.component.scss']
})
export class FlLoginDialogComponent implements OnInit {

  appRoute: string;

  disabledFooter: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) input: FlLoginDialogInput,
              private dialogRef: MatDialogRef<FlLoginDialogComponent>) {
    this.appRoute = input.appRoute;
    this.disabledFooter = input.disabledFooter;
  }

  ngOnInit(): void {
  }

  onLoginSuccess(response: any): void {
    const result: FlLoginDialogResult = {success: true, response: response};
    this.dialogRef.close(result);
  }

}
