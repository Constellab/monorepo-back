import {Component, OnInit} from '@angular/core';
import {MatLegacySnackBarRef as MatSnackBarRef} from '@angular/material/legacy-snack-bar';

@Component({
  selector: 'fl-new-website-version',
  templateUrl: './fl-new-website-version.component.html',
  styleUrls: ['./fl-new-website-version.component.scss']
})
export class FlNewWebsiteVersionComponent implements OnInit {

  constructor(private snackBarRef: MatSnackBarRef<FlNewWebsiteVersionComponent>) {
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
