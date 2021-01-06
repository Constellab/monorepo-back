import {Component, Inject, OnInit} from '@angular/core';
import {SnackBarInfoInput, SnackBarMode} from '../../../../model/global/snack-bar.class';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';

/**
 * Simple snack bar to display an error or success message
 */
@Component({
  selector: 'gen-snack-bar-info',
  templateUrl: './snack-bar-info.component.html',
  styleUrls: ['./snack-bar-info.component.scss']
})
export class SnackBarInfoComponent implements OnInit {


  mode: SnackBarMode;
  text: string;
  showCloseButton: boolean;

  constructor(@Inject(MAT_SNACK_BAR_DATA) data: SnackBarInfoInput,
              private snackBarRef: MatSnackBarRef<SnackBarInfoComponent>) {
    if (data.mode == null) {
      console.error('The mode input is missing in the snack bar info');
    }
    if (data.text == null) {
      console.error('The text input is missing in the snack bar info');
    }

    this.mode = data.mode;
    this.text = data.text;
    this.showCloseButton = data.showCloseButton;
  }

  ngOnInit(): void {
  }

  closeSnackBar(): void {
    this.snackBarRef.dismiss();
  }

}
