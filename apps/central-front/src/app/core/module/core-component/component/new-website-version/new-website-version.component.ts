import {Component, OnInit} from '@angular/core';
import {MatSnackBarRef} from '@angular/material/snack-bar';

@Component({
  selector: 'gen-new-website-version',
  templateUrl: './new-website-version.component.html',
  styleUrls: ['./new-website-version.component.scss']
})
export class NewWebsiteVersionComponent implements OnInit {

  constructor(private snackBarRef: MatSnackBarRef<NewWebsiteVersionComponent>) {
  }

  ngOnInit(): void {
  }

  reload(): void {
    location.reload();
  }

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
