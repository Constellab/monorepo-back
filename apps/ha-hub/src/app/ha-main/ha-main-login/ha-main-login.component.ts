import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {HaAuthenticatedUserService} from '../../ha-core/ha-service/ha-authenticated-user.service';

@Component({
  selector: 'ha-admin-list-page',
  templateUrl: './ha-main-login.component.html',
  styleUrls: ['./ha-main-login.component.scss']
})
export class HaMainLoginComponent implements OnInit{

  constructor(
    public dialogRef: MatDialogRef<HaMainLoginComponent>,
    public authUserService: HaAuthenticatedUserService
  ) {
  }

  ngOnInit(): void {
  }

  closeDialog(): void {
    this.authUserService.setCurrentUser();
    this.dialogRef.close();
  }
}
