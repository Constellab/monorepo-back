import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {HaAuthenticatedUserService} from '../../../../../ha-core/ha-service/ha-authenticated-user.service';

@Component({
  selector: 'ha-admin-list-page',
  templateUrl: './ha-public-login.component.html',
  styleUrls: ['./ha-public-login.component.scss']
})
export class HaPublicLoginComponent implements OnInit{

  constructor(
    public dialogRef: MatDialogRef<HaPublicLoginComponent>,
    public authUserService: HaAuthenticatedUserService
  ) {
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.authUserService.setCurrentUser();
    this.dialogRef.close();
  }
}
