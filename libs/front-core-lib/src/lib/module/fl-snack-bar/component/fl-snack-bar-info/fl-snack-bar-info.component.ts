import {Component, Inject, OnInit} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';
import {FlSnackBarInfoInput, FlSnackBarMode} from '../../model/fl-snack-bar.class';

/**
 * Simple snack bar to display an error or success message
 */
@Component({
  selector: 'fl-snack-bar-info',
  templateUrl: './fl-snack-bar-info.component.html',
  styleUrls: ['./fl-snack-bar-info.component.scss']
})
export class FlSnackBarInfoComponent implements OnInit {


  mode: FlSnackBarMode;
  text: string;
  showCloseButton: boolean;
  showDetailButton: boolean;

  constructor(@Inject(MAT_SNACK_BAR_DATA) private data: FlSnackBarInfoInput,
              private snackBarRef: MatSnackBarRef<FlSnackBarInfoComponent>) {
    if (data.mode == null) {
      console.error('The mode input is missing in the snack bar info');
    }
    if (data.text == null) {
      console.error('The text input is missing in the snack bar info');
    }

    this.mode = data.mode;
    this.text = data.text;
    this.showCloseButton = data.additionalConfig.showCloseButton;
    this.showDetailButton = data.additionalConfig.detailButton != null;
  }

  ngOnInit(): void {
  }

  closeSnackBar(): void {
    this.snackBarRef.dismiss();
  }

  openDetailDialog(event: MouseEvent): void {
    this.data.additionalConfig.detailButton(event);
    this.closeSnackBar();
  }

}
